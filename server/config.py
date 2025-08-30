import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings

load_dotenv()

def get_env_variable(var_name: str, default: str = None) -> str:
    """Gets an environment variable or raises an error if it's not set."""
    value = os.getenv(var_name)
    if value is None:
        if default is None:
            raise ValueError(f"Environment variable '{var_name}' must be set.")
        return default
    return value

# --- API Keys ---
MURF_API_KEY = get_env_variable("MURF_API_KEY")
MURF_VOICE_ID = get_env_variable("MURF_VOICE_ID")
GOOGLE_API_KEY = get_env_variable("GOOGLE_API_KEY")
PINECONE_API_KEY = get_env_variable("PINECONE_API_KEY")

# --- Pinecone Settings ---
PINECONE_INDEX_NAME = get_env_variable("PINECONE_INDEX_NAME", "mobile-phones")
PINECONE_EMBEDDING_DIMENSION = 768

# --- LLM and Embeddings ---
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0)
embeddings_model = GoogleGenerativeAIEmbeddings(model="models/embedding-001")