from fastapi import APIRouter
from pydantic import BaseModel
from typing import Literal

router = APIRouter()

class TriggerActionRequest(BaseModel):
    """Request model for triggering avatar actions."""
    action: Literal["wave", "nod", "idle"] = "idle"

class TriggerActionResponse(BaseModel):
    """Response model for trigger action endpoint."""
    success: bool
    behavior: str
    message: str

@router.post("/trigger-action", response_model=TriggerActionResponse)
async def trigger_action(req: TriggerActionRequest):
    """
    Simple endpoint to trigger avatar behaviors.
    Returns JSON response with the behavior to trigger.
    """
    behavior = req.action
    
    return {
        "success": True,
        "behavior": behavior,
        "message": f"Triggered {behavior} animation"
    }

