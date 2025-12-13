# from fastapi import APIRouter
# from app.models.request_model import InteractRequest

# router = APIRouter()

# @router.post("/")
# async def interact(req: InteractRequest):
#     # temporary mock response for Day 1
#     return {
#         "text": f"Echo: {req.message}",
#         "audio": "",          # placeholder
#         "behavior": {"gesture": "idle", "emotion": "neutral"}
#     }

from fastapi import APIRouter
from app.models.request_model import InteractRequest
from app.services.tts_service import text_to_speech_base64
import base64

router = APIRouter()

@router.post("/")
async def interact(req: InteractRequest):
    # Temporary AI text (replace later)
    reply_text = f"Echo: {req.message}"

    # Generate audio base64
    audio_b64 = await text_to_speech_base64(reply_text)

    # decode base64 to raw bytes to save
    audio_bytes = base64.b64decode(audio_b64)

    with open("debug_output.wav", "wb") as f:
        f.write(audio_bytes)

    # Simple behavior mapping (mock)
    behavior = {"gesture": "idle", "emotion": "neutral"}

    return {"text": reply_text, "audio": audio_b64, "behavior": behavior}
