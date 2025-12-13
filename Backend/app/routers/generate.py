from fastapi import APIRouter, HTTPException
from app.models.generate_model import GenerateRequest
from app.services import tts_service, cache_service
from app.config.global_state import TTS_SEMAPHORE, requests_count, total_latency

import logging
import time
import asyncio
import base64
from typing import Dict

# --- Router ---
router = APIRouter()
logger = logging.getLogger("generate")

# --- Import brain.py ---
try:
    from .. import brain
    run_chat_brain = brain.run_chat_brain
except ImportError:
    logger.warning("'brain.py' not found. Using fallback brain.")

    async def run_chat_brain(user_input: str, persona_key: str, context_text: str) -> Dict:
        return {"response_text": f"Echo: {user_input}", "behavior_json": {"gesture": "idle"}}


@router.post("/")
async def generate(req: GenerateRequest):
    """
    Process a GenerateRequest:
    1. Check AI cache
    2. Call brain.py if not cached
    3. Generate TTS audio (base64)
    4. Update request metrics
    """
    global requests_count, total_latency

    if len(req.prompt) > 5000:
        raise HTTPException(status_code=400, detail="Prompt too long")

    start_time = time.time()

    # --- 1) AI Cache ---
    cache_key = (req.prompt, str(req.persona))
    ai_out = cache_service.ai_cache.get(cache_key)
    if ai_out:
        logger.info("🧠 Brain Cache Hit")
    else:
        # --- 2) Call brain.py ---
        # Map API fields to brain.py variables:
        # - req.prompt → user_input
        # - req.nodeGraph (string) → knowledge_context
        # - req.persona.prompt or req.persona.persona_prompt → persona_prompt (direct)
        # - req.persona.id → persona_key (fallback lookup)
        context_text = req.nodeGraph if isinstance(req.nodeGraph, str) else ""
        persona_dict = req.persona or {}
        persona_prompt = persona_dict.get("prompt") or persona_dict.get("persona_prompt")
        persona_key = persona_dict.get("id", "professional")
        
        try:
            logger.info(f"Calling brain with: user_input='{req.prompt[:50]}...', persona_key='{persona_key}', context_len={len(context_text)}")
            brain_result = await run_chat_brain(
                user_input=req.prompt,
                persona_key=persona_key,
                context_text=context_text,
                persona_prompt=persona_prompt
            )
            logger.info(f"Brain returned type: {type(brain_result)}, value: {brain_result}")
            
            if not brain_result:
                logger.error("Brain returned None or empty result")
                ai_out = {"text": "Brain returned empty result", "signals": {"gesture": "idle"}}
            else:
                # brain.py returns {"text": ..., "behavior": ...}
                # Handle both formats for compatibility
                text = brain_result.get("text") or brain_result.get("response_text") or ""
                signals = brain_result.get("behavior") or brain_result.get("behavior_json") or {}
                ai_out = {"text": text, "signals": signals}
                logger.info(f"Extracted ai_out: text='{text[:100] if text else '(empty)'}', signals={signals}")
                cache_service.ai_cache[cache_key] = ai_out
        except Exception as e:
            logger.exception("❌ Brain failed")
            ai_out = {"text": f"Error processing prompt: {str(e)}", "signals": {"gesture": "idle"}}

    text = ai_out.get("text", "")
    signals = ai_out.get("signals", {})

    # --- 3) TTS (with cache) ---
    persona_dict = req.persona or {}
    voice = persona_dict.get("voice", "en-US-GuyNeural")
    
    # Validate text before TTS
    if not text or not text.strip():
        logger.warning("Empty text received from brain, skipping TTS")
        audio_b64 = ""
    else:
        tts_cache_key = f"{text}::{voice}"
        audio_b64 = cache_service.audio_cache.get(tts_cache_key)

        if not audio_b64:
            try:
                logger.info(f"TTS input (voice={voice}): {text[:200]}")
                async with TTS_SEMAPHORE:
                    audio_b64 = await tts_service.text_to_speech_base64(text, voice=voice)
                if audio_b64:
                    cache_service.audio_cache[tts_cache_key] = audio_b64
                    logger.info(f"TTS generated audio successfully ({len(audio_b64)} chars base64)")
                else:
                    logger.warning("TTS returned empty audio")
            except Exception as e:
                logger.exception("TTS generation failed")
                audio_b64 = ""

    # --- 4) Debug: Save MP3 locally ---
    if audio_b64:
        try:
            with open("audio.mp3", "wb") as f:
                f.write(base64.b64decode(audio_b64))
            logger.info("Debug MP3 written to audio_output.mp3")
        except Exception as e:
            logger.warning("Failed to write debug MP3: %s", e)

    # --- 5) Update metrics ---
    elapsed_ms = (time.time() - start_time) * 1000
    requests_count += 1
    total_latency += elapsed_ms
    logger.info("✅ Generate processed in %.1fms", elapsed_ms)

    return {"text": text, "audio": audio_b64, "signals": signals}










# from fastapi import APIRouter, HTTPException
# from app.models.generate_model import GenerateRequest
# from app.services import tts_service, cache_service
# import logging, time, base64

# # --- Router ---
# router = APIRouter()
# logger = logging.getLogger("generate")

# # --- Import shared globals from main.py ---
# from app.config.global_state import TTS_SEMAPHORE, requests_count, total_latency

# # --- Import brain.py ---
# try:
#     from Backend.brain import run_chat_brain
# except ImportError:
#     logger.warning("'brain.py' not found. Using fallback brain.")
#     async def run_chat_brain(user_input, persona_key, context_text):
#         # fallback returns exactly what it gets
#         return {"response_text": f"Echo: {user_input}", "behavior_json": {"gesture": "idle"}}

# @router.post("/")
# async def generate(req: GenerateRequest):
#     global requests_count, total_latency

#     if len(req.prompt) > 5000:
#         raise HTTPException(status_code=400, detail="Prompt too long")

#     start = time.time()

#     # --- 1) Check AI cache ---
#     cache_key = (req.prompt, str(req.persona))
#     ai_cached = cache_service.ai_cache.get(cache_key)
#     if ai_cached:
#         logger.info("🧠 Brain Cache Hit")
#         brain_result = ai_cached
#     else:
#         # --- 2) Call brain.py ---
#         context_text = req.nodeGraph if isinstance(req.nodeGraph, str) else ""
#         try:
#             brain_result = await run_chat_brain(
#                 user_input=req.prompt,
#                 persona_key=req.persona.get("id", "professional"),
#                 context_text=context_text
#             )
#             # Store raw brain output in cache
#             cache_service.ai_cache[cache_key] = brain_result
#         except Exception as e:
#             logger.error("❌ Brain failed: %s", e)
#             brain_result = {"response_text": f"Error: {req.prompt}", "behavior_json": {"gesture": "idle"}}

#     # --- Extract outputs exactly as brain.py returned ---
#     text = brain_result.get("response_text", "")
#     signals = brain_result.get("behavior_json", {})

#     # --- 3) TTS ---
#     voice = req.persona.get("voice") or "en-US-GuyNeural"
#     tts_cache_key = f"{text}::{voice}"
#     audio_b64 = cache_service.audio_cache.get(tts_cache_key)

#     if not audio_b64:
#         try:
#             async with TTS_SEMAPHORE:
#                 audio_b64 = await tts_service.text_to_speech_base64(text, voice=voice)
#             if audio_b64:
#                 cache_service.audio_cache[tts_cache_key] = audio_b64
#             else:
#                 logger.warning("TTS returned empty audio")
#         except Exception as e:
#             logger.exception("TTS generation failed: %s", e)
#             audio_b64 = ""

#     # --- 4) Debug: write MP3 locally ---
#     if audio_b64:
#         debug_path = "audio_output.mp3"
#         try:
#             with open(debug_path, "wb") as f:
#                 f.write(base64.b64decode(audio_b64))
#             logger.info("Debug MP3 written to %s", debug_path)
#         except Exception as e:
#             logger.warning("Failed to write debug MP3: %s", e)

#     # --- 5) Update metrics ---
#     elapsed = (time.time() - start) * 1000
#     requests_count += 1
#     total_latency += elapsed
#     logger.info("✅ Generate processed in %.1fms", elapsed)

#     # --- 6) Return exactly what brain.py provided (with audio added) ---
#     return {
#         "text": text,
#         "audio": audio_b64,
#         "signals": signals
#     }










# from fastapi import APIRouter, HTTPException
# from app.models.generate_model import GenerateRequest
# from app.services import tts_service, cache_service
# import logging, time, asyncio
# import base64

# # --- Router ---
# router = APIRouter()
# logger = logging.getLogger("generate")

# # --- Import shared globals from main.py ---
# from app.config.global_state import TTS_SEMAPHORE, requests_count, total_latency

# # --- Import brain.py ---
# try:
#     from Backend.brain import run_chat_brain
# except ImportError:
#     logger.warning("'brain.py' not found. Using fallback brain.")
#     async def run_chat_brain(user_input, persona_key, context_text):
#         return {"response_text": f"Echo: {user_input}", "behavior_json": {"gesture": "idle"}}

# @router.post("/")
# async def generate(req: GenerateRequest):
#     global requests_count, total_latency

#     if len(req.prompt) > 5000:
#         raise HTTPException(status_code=400, detail="Prompt too long")

#     start = time.time()

#     # --- 1) Check AI cache ---
#     cache_key = (req.prompt, str(req.persona))
#     ai_cached = cache_service.ai_cache.get(cache_key)
#     if ai_cached:
#         logger.info("🧠 Brain Cache Hit")
#         ai_out = ai_cached
#     else:
#         # --- 2) Call brain.py ---
#         context_text = req.nodeGraph if isinstance(req.nodeGraph, str) else ""
#         try:
#             brain_result = await run_chat_brain(
#                 user_input=req.prompt,
#                 persona_key=req.persona.get("id", "professional"),
#                 context_text=context_text
#             )
#             ai_out = {
#                 "text": brain_result.get("response_text", ""),
#                 "signals": brain_result.get("behavior_json", {})
#             }
#             cache_service.ai_cache[cache_key] = ai_out
#         except Exception as e:
#             logger.error("❌ Brain failed: %s", e)
#             ai_out = {"text": f"Error: {req.prompt}", "signals": {"gesture": "idle"}}

#     text = ai_out.get("text", "")
#     signals = ai_out.get("signals", {})

#     # --- 3) TTS ---
#     voice = req.persona.get("voice") or "en-US-GuyNeural"
#     tts_cache_key = f"{text}::{voice}"
#     audio_b64 = cache_service.audio_cache.get(tts_cache_key)

#     if not audio_b64:
#         try:
#             async with TTS_SEMAPHORE:
#                 audio_b64 = await tts_service.text_to_speech_base64(text, voice=voice)
#             if audio_b64:
#                 cache_service.audio_cache[tts_cache_key] = audio_b64
#             else:
#                 logger.warning("TTS returned empty audio")
#         except Exception as e:
#             logger.exception("TTS generation failed: %s", e)
#             audio_b64 = ""

#     # --- 3) Write debug MP3 locally ---
#     if audio_b64:
#         debug_path = "audio_output.mp3"
#         try:
#             with open(debug_path, "wb") as f:
#                 f.write(base64.b64decode(audio_b64))
#             logger.info("Debug MP3 written to %s", debug_path)
#         except Exception as e:
#             logger.warning("Failed to write debug MP3: %s", e)

#     # --- 4) Update metrics ---
#     elapsed = (time.time() - start) * 1000
#     requests_count += 1
#     total_latency += elapsed
#     logger.info("✅ Generate processed in %.1fms", elapsed)

#     return {"text": text, "audio": audio_b64, "signals": signals}











# from fastapi import APIRouter, HTTPException
# from app.models.generate_model import GenerateRequest, GenerateResponse
# from app.services import tts_service, cache_service
# import httpx, asyncio, os, time, logging
# import base64

# router = APIRouter()
# logger = logging.getLogger("generate")

# # environment or config
# AI_BACKEND_URL = os.getenv("AI_BACKEND_URL", "http://localhost:9000/brain")  # Member 3
# HTTP_TIMEOUT = 8.0

# async def call_ai_backend(payload: dict):
#     """Call AI backend with retries"""
#     async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
#         for attempt in range(3):
#             try:
#                 r = await client.post(AI_BACKEND_URL, json=payload)
#                 r.raise_for_status()
#                 return r.json()
#             except Exception as e:
#                 logger.warning("AI backend call failed attempt %s: %s", attempt + 1, e)
#                 await asyncio.sleep(0.2 * (attempt + 1))
#         raise RuntimeError("AI backend unreachable after retries")


# @router.post("/generate", response_model=GenerateResponse)
# async def generate(req: GenerateRequest):
    
#     if len(req.prompt) > 5000:
#         raise HTTPException(status_code=400, detail="Prompt too long")
    
#     start = time.time()

#     # --- 1) Call AI backend (or mock) ---
#     ai_req = {"prompt": req.prompt, "persona": req.persona, "nodeGraph": req.nodeGraph}
#     cache_key = (req.prompt, str(req.persona), str(req.nodeGraph))
#     ai_cached = cache_service.ai_cache.get(cache_key)

#     if ai_cached:
#         ai_out = ai_cached
#     else:
#         try:
#             # Mock response (replace with actual backend call later)
#             ai_out = {
#                 "text": f"You said: {req.prompt}",
#                 "signals": {"gesture": "wave"}
#             }
#             # Uncomment below for real backend
#             # ai_out = await call_ai_backend(ai_req)
#             cache_service.ai_cache[cache_key] = ai_out
#         except Exception as e:
#             logger.error("AI backend error: %s", e)
#             raise HTTPException(status_code=502, detail="AI backend error")

#     text = ai_out.get("text", "")
#     signals = ai_out.get("signals", {"gesture": "idle"})

#     # --- 2) TTS: Check cache, else generate ---
#     voice = req.persona.get("voice") or "en-US-GuyNeural"
#     tts_cache_key = f"{text}::{voice}"
#     audio_b64 = cache_service.audio_cache.get(tts_cache_key)

#     if not audio_b64:
#         try:
#             audio_b64 = await tts_service.text_to_speech_base64(text, voice=voice)
#             if audio_b64:  # cache only if TTS succeeded
#                 cache_service.audio_cache[tts_cache_key] = audio_b64
#             else:
#                 logger.warning("TTS returned empty audio for text: %s", text)
#         except Exception as e:
#             logger.exception("TTS generation failed: %s", e)
#             audio_b64 = ""

#     # --- 3) Write debug MP3 locally ---
#     if audio_b64:
#         debug_path = "debug_output.mp3"
#         with open(debug_path, "wb") as f:
#             f.write(base64.b64decode(audio_b64))
#         logger.info("Debug MP3 written to %s", debug_path)

#     elapsed = (time.time() - start) * 1000
#     logger.info("generate processed in %.1fms", elapsed)

#     return {"text": text, "audio": audio_b64, "signals": signals}




# from fastapi import APIRouter, HTTPException
# from app.models.generate_model import GenerateRequest, GenerateResponse
# from app.services import tts_service, cache_service
# import httpx, asyncio, base64, os, time, logging

# router = APIRouter()
# logger = logging.getLogger("generate")

# # environment or config
# AI_BACKEND_URL = os.getenv("AI_BACKEND_URL", "http://localhost:9000/brain")  # Member 3
# HTTP_TIMEOUT = 8.0

# async def call_ai_backend(payload: dict):
#     # simple retry loop
#     async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
#         for attempt in range(3):
#             try:
#                 r = await client.post(AI_BACKEND_URL, json=payload)
#                 r.raise_for_status()
#                 return r.json()
#             except Exception as e:
#                 logger.warning("AI backend call failed attempt %s: %s", attempt+1, e)
#                 await asyncio.sleep(0.2 * (attempt+1))
#         raise RuntimeError("AI backend unreachable after retries")

# @router.post("/generate", response_model=GenerateResponse)
# async def generate(req: GenerateRequest):
#     start = time.time()

#     # 1) Ask AI backend (Member 3) for reply + signals (expected shape: {text, signals})
#     ai_req = {"prompt": req.prompt, "persona": req.persona, "nodeGraph": req.nodeGraph}
#     # check ai cache first
#     cache_key = (req.prompt, str(req.persona), str(req.nodeGraph))
#     ai_cached = cache_service.ai_cache.get(cache_key)
#     if ai_cached:
#         ai_out = ai_cached
#     else:
#         try:
#             ai_out = {
#                 "text": f"You said: {req.prompt}",
#                 "signals": {"gesture": "wave"}
#             }
#             # ai_out = await call_ai_backend(ai_req)
#             cache_service.ai_cache[cache_key] = ai_out
#         except Exception as e:
#             logger.error("AI backend error: %s", e)
#             raise HTTPException(status_code=502, detail="AI backend error")

#     # ai_out expected: {"text":"...", "signals": {...}}
#     text = ai_out.get("text", "")
#     signals = ai_out.get("signals", {"gesture":"idle"})

#     # 2) Check audio cache, else generate TTS
#     tts_cache_key = f"{text}::{req.persona.get('voice','en-US-GuyNeural')}"
#     audio_b64 = cache_service.audio_cache.get(tts_cache_key)
#     if not audio_b64:
#         try:
#             audio_b64 = await tts_service.text_to_speech_base64(text, voice=req.persona.get("voice", "default"))
#             # cache it
#             if audio_b64:
#                 cache_service.audio_cache[tts_cache_key] = audio_b64
#         except Exception as e:
#             logger.exception("TTS generation failed: %s", e)
#             # fallback: empty audio or short silence
#             audio_b64 = ""
    
#     if audio_b64:
#         with open("debug.mp3", "wb") as f:
#             f.write(base64.b64decode(audio_b64))

#     elapsed = (time.time() - start) * 1000
#     logger.info("generate processed in %.1fms", elapsed)

#     return {"text": text, "audio": audio_b64, "signals": signals}
