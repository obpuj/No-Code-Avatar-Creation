from pydantic import BaseModel
from typing import Optional, Dict, Any, Union

class GenerateRequest(BaseModel):
    prompt: str
    persona: Optional[Dict[str, Any]] = None
    # Accept either a dict payload or a simple string for context.
    nodeGraph: Optional[Union[Dict[str, Any], str]] = None

class GenerateResponse(BaseModel):
    text: str
    audio: str        # base64
    signals: Dict     # e.g. {"gesture":"wave"}
