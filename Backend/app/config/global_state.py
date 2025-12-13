import asyncio

# Limit concurrent TTS calls
TTS_SEMAPHORE = asyncio.Semaphore(6)

# Metrics state
requests_count = 0
total_latency = 0
