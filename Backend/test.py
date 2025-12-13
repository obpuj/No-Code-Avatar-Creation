import asyncio
from app.services.tts_service import text_to_speech_base64
import base64

async def main():
    audio_b64 = await text_to_speech_base64("Hello world")
    if audio_b64:
        with open("test.mp3", "wb") as f:
            f.write(base64.b64decode(audio_b64))
        print("MP3 saved!")
    else:
        print("No audio returned.")

asyncio.run(main())
