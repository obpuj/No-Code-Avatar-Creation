from cachetools import TTLCache

# small in-memory cache for hackathon
audio_cache = TTLCache(maxsize=512, ttl=60*60)  # 1 hour TTL
ai_cache    = TTLCache(maxsize=1024, ttl=60*30) # 30 min
