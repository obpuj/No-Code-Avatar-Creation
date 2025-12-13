# Testing Guide

## Quick Testing Options

### Option 1: Test Without Avatar Export (Easiest)

You can test the backend integration directly without needing to export from Ready Player Me:

1. **Test the Persona Builder** (No avatar needed):
   ```
   http://localhost:3000/persona_builder
   ```
   - This page lets you test the full backend integration
   - Enter a prompt, persona, and knowledge context
   - See the AI response, audio, and behavior signals

2. **Test Avatar Page with Test Avatar**:
   ```
   http://localhost:3000/avatar_page?test=1
   ```
   - Uses a default test avatar URL
   - Full chat interface with backend integration
   - No Ready Player Me export needed

### Option 2: Use a Ready Player Me Avatar URL Directly

If you have a Ready Player Me avatar URL from a previous export, you can use it directly:

```
http://localhost:3000/avatar_page?avatar=YOUR_AVATAR_URL_HERE
```

Example:
```
http://localhost:3000/avatar_page?avatar=https://models.readyplayer.me/64e4a4b0e7c0a8a1c8b4b5c5.glb
```

### Option 3: Fix Ready Player Me Export

If the export button isn't working, try:

1. **Use the Manual Export Button**:
   - In the Avatar Creator modal, look for the "📥 Export Avatar" button in the top-right
   - Click it after customizing your avatar
   - This triggers the export programmatically

2. **Check Browser Console**:
   - Open browser DevTools (F12)
   - Check for any errors in the Console tab
   - Look for messages like "✅ Avatar Exported:" when export succeeds

3. **Try Different Browser**:
   - Ready Player Me iframe might have issues in some browsers
   - Try Chrome, Firefox, or Safari

4. **Check iframe Permissions**:
   - Make sure pop-ups aren't blocked
   - Check if camera/microphone permissions are granted if needed

## Testing the Backend Integration

### 1. Start Backend
```bash
cd Backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Endpoints

**Test Backend Directly:**
```bash
curl -X POST http://localhost:8000/generate/ \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Hello, how are you?",
    "persona": {
      "id": "professional",
      "voice": "en-US-GuyNeural"
    },
    "nodeGraph": "This is a test knowledge base."
  }'
```

**Test Frontend Pages:**
- Persona Builder: http://localhost:3000/persona_builder
- Avatar Page (Test Mode): http://localhost:3000/avatar_page?test=1

## What to Test

1. **Basic Chat**:
   - Send a simple message like "Hello"
   - Should get a response with text, audio, and behavior signals

2. **Persona Customization**:
   - In Settings, add a custom persona prompt
   - Test that responses match the persona

3. **Knowledge Context**:
   - Add knowledge context in Settings
   - Ask questions about the context
   - Verify responses are grounded in the knowledge base

4. **Audio Playback**:
   - Check that audio plays correctly
   - Verify lip sync works with the avatar

5. **Behavior Signals**:
   - Check that avatar animations match the behavior signals
   - Test different gestures: wave, talking, idle

## Troubleshooting

### Backend Not Responding
- Check if backend is running on port 8000
- Verify CORS is configured (already done)
- Check backend logs for errors

### Frontend Can't Connect
- Verify `NEXT_PUBLIC_API_URL` in `.env.local` is `http://localhost:8000`
- Check browser console for CORS errors
- Make sure both services are running

### Avatar Not Loading
- Check browser console for 3D model loading errors
- Verify the avatar URL is valid
- Try the test avatar URL: `https://models.readyplayer.me/64e4a4b0e7c0a8a1c8b4b5c5.glb`

### Audio Not Playing
- Check browser autoplay policies (may need user interaction)
- Verify TTS service is working in backend
- Check browser console for audio errors

