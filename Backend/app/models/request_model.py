from pydantic import BaseModel
from typing import Optional, Dict

class InteractRequest(BaseModel):
    message: str
    persona: Optional[Dict] = {}
    nodeGraph: Optional[Dict] = {}
