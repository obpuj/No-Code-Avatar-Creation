#!/bin/bash

# Start Frontend Server
# This script starts the Next.js frontend

cd "$(dirname "$0")/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
fi

# Start the development server
echo "Starting Next.js frontend on http://localhost:3000"
echo "Press Ctrl+C to stop"
npm run dev

