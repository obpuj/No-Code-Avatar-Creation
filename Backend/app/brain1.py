# --- TEMPORARY MOCK FUNCTION ---
async def run_chat_brain(user_input, persona_key, context_text):
    # Pretend to think for 1 second
    await asyncio.sleep(1)
    
    # Return fake data that looks EXACTLY like Member 3's output
    return {
        "response_text": f"Echo: {user_input}. This is a test response.",
        "behavior_json": {"emotion": "happy", "gesture": "wave"}
    }