# Frontend-Backend Integration Guide

This document explains how to run and integrate the frontend (Next.js) and backend (FastAPI) services.

## Prerequisites

- Python 3.9+ with venv
- Node.js 18+ and npm
- Backend dependencies installed in `Backend/venv/`

## Quick Start

### 1. Start the Backend (FastAPI)

```bash
# Navigate to Backend directory
cd Backend

# Activate virtual environment (Python dependencies are in venv)
source venv/bin/activate  # On macOS/Linux
# ORend
venv\Scripts\activate  # On Windows

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`

### 2. Start the Frontend (Next.js)

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies (if not already installed)
npm install

# Create .env.local file (if it doesn't exist)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start the Next.js development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Environment Configuration

### Frontend Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

This tells the frontend where to find the backend API. The default is `http://localhost:8000`.

### Backend Environment Variables

The backend requires a `.env` file in the `Backend/` directory with:

```env
GROQ_API_KEY=your_groq_api_key_here
```

## API Integration

### Backend Endpoints

- **POST `/generate/`** - Generate AI response with text, audio, and behavior signals
  - Request body: `{ prompt: string, persona?: object, nodeGraph?: string|object }`
  - Response: `{ text: string, audio: string (base64), signals: object }`

- **GET `/`** - Health check endpoint
  - Response: `{ status: "ok", message: "PersonaFlow backend running" }`

### Frontend API Client

The frontend uses `lib/api.js` which exports:

- `generateAPI.generate(prompt, persona, nodeGraph)` - Calls `/generate/` endpoint

## Integration Points

1. **Persona Builder Page** (`/persona_builder`) - Already integrated with backend
2. **Avatar Page** (`/avatar_page`) - Now includes chat interface with backend integration
3. **Home Page** (`/`) - Landing page, no backend integration needed

## Testing the Integration

1. Start both services (backend and frontend)
2. Navigate to `http://localhost:3000/persona_builder` to test the API
3. Or create an avatar and open it in `/avatar_page` to use the chat interface

## Troubleshooting

### CORS Errors

The backend already has CORS middleware configured to allow all origins. If you encounter CORS issues:

- Check that the backend is running on port 8000
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local` matches the backend URL

### Connection Refused

- Ensure the backend is running before starting the frontend
- Check that port 8000 is not in use by another application
- Verify the backend URL in frontend `.env.local`

### Python Dependencies

All Python dependencies are installed in `Backend/venv/`. Make sure to activate the virtual environment before running the backend.

## Development Notes

- Backend uses FastAPI with automatic reload (`--reload` flag)
- Frontend uses Next.js with hot module replacement
- Both services should be running simultaneously for full functionality
- The backend processes AI requests and generates TTS audio
- The frontend displays avatars and handles user interactions

