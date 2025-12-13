from fastapi import APIRouter

router = APIRouter()
requests_count = 0
total_latency = 0

@router.get("/metrics")
async def metrics():
    avg_latency = total_latency / requests_count if requests_count else 0
    return {"requests": requests_count, "avg_latency_ms": avg_latency}
