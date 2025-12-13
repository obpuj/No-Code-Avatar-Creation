# app/config/prompts.py
from pathlib import Path

PROMPT_DIR = Path(__file__).parent / "prompts"

def load_prompts():
    return {p.stem: p.read_text() for p in PROMPT_DIR.glob("*.txt")}

prompts = load_prompts()
