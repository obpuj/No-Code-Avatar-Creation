#!/bin/bash

# Start Backend Server
# This script activates the venv and starts the FastAPI backend

cd "$(dirname "$0")/Backend"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Error: venv directory not found in Backend/"
    echo "Please ensure Python dependencies are installed in Backend/venv/"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Make sure GROQ_API_KEY is set."
fi

# Start the server
echo "Starting FastAPI backend on http://localhost:8000"
echo "Press Ctrl+C to stop"
uvicorn main:app --reload --port 8000

