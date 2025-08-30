# 🤖 AI Sales Agent with Real-Time Voice

This repository contains the source code for a sophisticated, AI-powered conversational sales agent. The application provides an end-to-end user experience, allowing customers to find products, ask questions, and get special deals through a dynamic chat interface.

The core of this project is its voice interaction system, which enables users to speak their requests and hear the agent's responses, complete with a real-time audio visualizer.

_(Pro-tip: You can replace the link above with a GIF of your application in action!)_

---

## ✨ Key Features
- **Conversational Chat**: A dynamic chat interface for interacting with the AI agent.
- **Vector-Based Product Search**: Utilizes Pinecone to find relevant products based on the user's conversational queries.
- **Dynamic Deal Generation**: The agent can analyze the conversation and create special, time-sensitive deals.
- **Text-to-Speech (TTS)**: Integrates with Murf AI to generate high-quality, lifelike voice responses for the agent.
- **Speech-to-Text (STT)**: Uses the browser's built-in Web Speech API to transcribe user voice input for free.
- **Real-Time Audio Visualizer**: Displays a bouncing bar animation while the agent's audio is playing.
- **Autoplaying Welcome Message**: Greets the user with a voice message upon their first interaction with the site.

---

## 🛠️ Tech Stack

| Area      | Technology |
|-----------|------------|
| Frontend  | React (Vite), Tailwind CSS, Lucide React, Web Speech API |
| Backend   | FastAPI, Python |
| AI / Core | LangChain, LangGraph, Google Gemini (LLM), Pinecone (Vector Store), Murf AI (TTS) |

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
- **Node.js and npm**: Required for the frontend. [Download here](https://nodejs.org/).
- **Python 3.8+**: Required for the backend. [Download here](https://www.python.org/downloads/).
- **API Keys**: You will need API keys from Google, Pinecone, and Murf AI.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Backend Setup
The backend server handles all the AI logic, product retrieval, and text-to-speech generation.

```bash
# Navigate to the backend directory
cd backend

# Create a .env file for your API keys
# (See the "Environment Variables" section below and paste the content)
touch .env

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install the required Python packages
pip install -r requirements.txt

# Run the FastAPI server
python main.py
```
Your backend should now be running on [http://127.0.0.1:8000](http://127.0.0.1:8000).

### 3. Frontend Setup
The frontend provides the user interface for the chat application.

```bash
# Open a new terminal window
# Navigate to the frontend directory from the project root
cd frontend

# Install the required npm packages
npm install

# Run the React development server
npm run dev
```
Your frontend should now be running on [http://localhost:5173](http://localhost:5173) (or another port if 5173 is busy) and will connect to your local backend.

---

## 🔑 Environment Variables
For the backend to function, you must create a `.env` file inside the `/backend` directory. Copy the block below into this new file and add your secret keys where required.

```env
# Google API Key for Gemini LLM
GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY_HERE"

# Pinecone Configuration
PINECONE_API_KEY="YOUR_PINECONE_API_KEY_HERE"
PINECONE_INDEX_NAME="mobile-phones"

# Murf AI Configuration
MURF_API_KEY="ap2-42b9-abbd-82d92b8181e2"
MURF_VOICE_ID="en-US-natalie"
```

---

## 📂 Project Structure

```
.
├── backend/
│   ├── main.py         # FastAPI application entrypoint
│   ├── agent.py        # LangGraph agent definition
│   ├── schemas.py      # Pydantic data models
│   ├── tools.py        # Custom tools for the agent (find_product)
│   ├── vector_store.py # Pinecone setup and data population
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/ # Reusable React components
    │   ├── hooks/      # Custom React hooks (useTextToSpeech, useSpeechToText)
    │   ├── App.jsx     # Main application component
    │   └── main.jsx    # Frontend entrypoint
    ├── package.json
    └── ...
```
