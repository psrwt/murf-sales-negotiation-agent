import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import HumanMessage, AIMessage
from schemas import ChatRequest, ChatResponse, TTSRequest, SpecialDeal
from agent import chatbot_graph
from vector_store import populate_pinecone_data
from config import MURF_API_KEY, MURF_VOICE_ID

# --- FastAPI Application ---
app = FastAPI(title="Mobile Salesperson Chatbot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_speech_sync(text: str):
    """Synchronous function to generate speech and return audio URL."""
    if not MURF_API_KEY or not text.strip():
        return None

    url = "https://api.murf.ai/v1/speech/generate"
    headers = {
        "api-key": MURF_API_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "text": text,
        "voiceId": MURF_VOICE_ID,
        "format": "MP3",
        "sampleRate": 44100,
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        return data.get("audioFile")
    except requests.RequestException as e:
        print(f"Error calling Murf AI: {e}")
        return None

@app.on_event("startup")
def on_startup():
    """Populates Pinecone data on startup."""
    populate_pinecone_data()

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Handles chat requests and generates speech in one go."""
    history_messages = [
        HumanMessage(content=msg['content']) if msg['role'] == 'user'
        else AIMessage(content=msg['content'])
        for msg in request.history
    ]

    initial_state = {
        "messages": history_messages + [HumanMessage(content=request.user_message)],
        "retrieved_products": {},
        "product_context_ids": []
    }
    final_state = await chatbot_graph.ainvoke(initial_state)
    final_answer_args = final_state["messages"][-1].tool_calls[0]['args']
    
    agent_text_response = final_answer_args['text']

    # --- Generate Audio Here ---
    audio_url = generate_speech_sync(agent_text_response)

    all_retrieved_products = {}
    for products_dict in final_state.get('__intermediate_steps__', []):
        if isinstance(products_dict, dict) and 'retrieved_products' in products_dict:
            all_retrieved_products.update(products_dict['retrieved_products'])
    all_retrieved_products.update(final_state.get('retrieved_products', {}))

    response_products = [
        all_retrieved_products[pid]
        for pid in final_answer_args.get('product_ids', [])
        if pid in all_retrieved_products
    ]

    response_deal = None
    if final_answer_args.get('deal_heading') and final_answer_args.get('deal_product_ids'):
        deal_products = [
            all_retrieved_products[pid]
            for pid in final_answer_args['deal_product_ids']
            if pid in all_retrieved_products
        ]
        if deal_products:
            response_deal = SpecialDeal(
                heading=final_answer_args['deal_heading'],
                deal_price=final_answer_args['deal_price'],
                products_involved=deal_products
            )

    return ChatResponse(
        text=agent_text_response,
        audio_url=audio_url,  # <-- Include the audio URL in the response
        products=response_products,
        special_deal=response_deal
    )

@app.post("/generate-speech")
def generate_speech(req: TTSRequest):
    if not MURF_API_KEY:
        raise HTTPException(500, "Missing MURF_API_KEY env variable")
    if not req.text or not req.text.strip():
        raise HTTPException(400, "Text is required")
    voice_id = req.voice_id
    if not voice_id:
        raise HTTPException(400, "voice_id is required (or set MURF_VOICE_ID env var)")
    
    print("text:", req.text)
    print("voice_id:", req.voice_id)

    url = "https://api.murf.ai/v1/speech/generate"
    headers = {
        "api-key": MURF_API_KEY,
        "Content-Type": "application/json",
    }
    # Build payload with Murf’s exact field names
    payload = {
        "text": req.text,
        "voiceId": voice_id,
        "format": (req.format or "MP3").upper(),
        "sampleRate": req.sample_rate,
        "style": req.style,
        "encodeAsBase64": bool(req.encode_as_base64),
    }
    # Remove Nones so we only send what’s set
    payload = {k: v for k, v in payload.items() if v is not None}

    try:
        r = requests.post(url, headers=headers, json=payload, timeout=60)
        # Murf returns JSON with `audioFile` (URL) and optionally `encodedAudio` (Base64)
        r.raise_for_status()
        data = r.json()
        audio_url = data.get("audioFile")
        audio_b64 = data.get("encodedAudio")

        print(audio_url)

        if not audio_url and not audio_b64:
            raise HTTPException(502, "Murf did not return audio")

        return {"audio_url": audio_url, "audio_base64": audio_b64, "meta": {
            "length_seconds": data.get("audioLengthInSeconds"),
            "consumed_chars": data.get("consumedCharacterCount"),
            "remaining_chars": data.get("remainingCharacterCount"),
            "warning": data.get("warning"),
        }}
    except requests.HTTPError as e:
        # Surface Murf’s error body for easier debugging
        detail = e.response.text if e.response is not None else str(e)
        raise HTTPException(status_code=e.response.status_code if e.response else 502,
                            detail=f"Murf API error: {detail}")
    except requests.RequestException as e:
        raise HTTPException(502, f"Network error calling Murf: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)