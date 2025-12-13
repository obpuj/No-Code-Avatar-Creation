import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services import tts_service, cache_service
# from app.routers.health import router as health_router
# from app.routers.interact import router as interact_router
from app.routers.generate import router as generate_router
from app.routers.trigger import router as trigger_router
# from app.routers.metrics import router as metrics_router

# --- Logging ---
log_level = logging.DEBUG if os.getenv("DEBUG", "1") == "1" else logging.INFO
logging.basicConfig(
    level=log_level,
    format="%(asctime)s %(levelname)s %(name)s %(message)s"
)

logger = logging.getLogger(__name__)
logger.info("Logging initialized")

# --- FastAPI app ---
app = FastAPI(title="PersonaFlow Backend (Dev)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include routers ---
# app.include_router(health_router, prefix="/health")
# app.include_router(interact_router, prefix="/interact")
app.include_router(generate_router, prefix="/generate")
app.include_router(trigger_router)  # No prefix - endpoint is /trigger-action
# app.include_router(metrics_router, prefix="/metrics")

@app.get("/")
async def root():
    return {"status": "ok", "message": "PersonaFlow backend running"}

# --- Prewarm TTS cache at startup ---
async def prewarm_tts():
    from app.config.global_state import TTS_SEMAPHORE

    for text in ["Hello!", "Welcome!"]:
        k = f"{text}::default"
        if k not in cache_service.audio_cache:
            try:
                async with TTS_SEMAPHORE:
                    audio = await tts_service.text_to_speech_base64(text)
                if audio:
                    cache_service.audio_cache[k] = audio
                    logger.info("Prewarmed TTS for: %s", text)
            except Exception as e:
                logger.warning("Prewarm TTS failed for '%s': %s", text, e)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up PersonaFlow backend...")
    await prewarm_tts()
    logger.info("TTS prewarm completed")












# import logging
# import os

# # Set DEBUG mode from environment variable
# if os.getenv("DEBUG", "1") == "1":
#     logging.getLogger().setLevel(logging.DEBUG)

# # Configure basic logging
# logging.basicConfig(
#     level=logging.INFO,
#     format="%(asctime)s %(levelname)s %(name)s %(message)s"
# )

# logger = logging.getLogger(__name__)
# logger.info("Logging initialized")

# import asyncio

# TTS_SEMAPHORE = asyncio.Semaphore(6)  # limit concurrent TTS calls

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from app.routers.health import router as health_router
# from app.routers.interact import router as interact_router
# from app.routers.generate import router as generate_router
# from app.routers.metrics import router as metrics_router
# from app.services import tts_service, cache_service

# app = FastAPI(title="PersonaFlow Backend (Dev)")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # tighten in prod
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(health_router, prefix="/health")
# app.include_router(interact_router, prefix="/interact")
# app.include_router(generate_router, prefix="/generate")
# app.include_router(metrics_router, prefix="/metrics")

# @app.get("/")
# async def root():
#     return {"status": "ok", "message": "PersonaFlow backend running"}

# # Prewarm TTS cache
# async def prewarm():
#     for text in ["Hello!", "Welcome!"]:
#         k = f"{text}::default"
#         if k not in cache_service.audio_cache:
#             audio = await tts_service.text_to_speech_base64(text)
#             if audio:
#                 cache_service.audio_cache[k] = audio

# @app.on_event("startup")
# async def startup_event():
#     await prewarm()