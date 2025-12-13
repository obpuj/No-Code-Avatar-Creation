import edge_tts
import base64
import uuid
import os
import asyncio
import logging

logger = logging.getLogger("tts")
logger.setLevel(logging.DEBUG)

TEMP_DIR = "tmp_audio"
os.makedirs(TEMP_DIR, exist_ok=True)

async def text_to_speech_base64(text: str, voice: str = "en-US-GuyNeural"):
    """
    Use edge-tts to synthesize text to mp3 and return base64 string.
    """
    # Validate inputs
    if not text or not text.strip():
        logger.warning("TTS called with empty text")
        return ""
    
    if not voice:
        logger.warning("TTS called with empty voice, using default")
        voice = "en-US-GuyNeural"
    
    try:
        logger.debug(f"TTS generating audio: text='{text[:100]}...', voice='{voice}'")
        filename = os.path.join(TEMP_DIR, f"{uuid.uuid4().hex}.mp3")
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(filename)
        
        # Check if file was created and has content
        if not os.path.exists(filename):
            logger.error("TTS file was not created")
            return ""
        
        with open(filename, "rb") as f:
            b = f.read()
        
        if len(b) == 0:
            logger.error("TTS file is empty")
            return ""
        
        # Cleanup
        try:
            os.remove(filename)
        except OSError as e:
            logger.warning(f"Failed to remove temp file: {e}")
        
        result = base64.b64encode(b).decode("utf-8")
        logger.debug(f"TTS generated {len(b)} bytes of audio")
        return result
        
    except Exception as e:
        logger.exception(f"TTS error: {e}")
        return ""
