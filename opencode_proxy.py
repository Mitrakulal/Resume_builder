"""OpenAI-compatible local bridge to the official OpenCode server."""

import os
import time
import uuid

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request

load_dotenv()

app = FastAPI(title="OpenCode compatibility bridge")

OPENCODE_SERVER_URL = os.getenv("OPENCODE_SERVER_URL", "http://127.0.0.1:4097")
OPENCODE_PROVIDER_ID = os.getenv("OPENCODE_PROVIDER_ID", "opencode")
OPENCODE_MODEL = os.getenv("OPENCODE_MODEL", "muse-spark-1.3-contributor-free")


@app.get("/health")
async def health() -> dict[str, str]:
    """Report whether the official OpenCode server is reachable."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{OPENCODE_SERVER_URL}/global/health")

    if response.is_error:
        raise HTTPException(response.status_code, "OpenCode server is unavailable")

    return {"status": "ok"}


@app.post("/v1/chat/completions")
async def chat_completions(request: Request) -> dict:
    """Translate an OpenAI-style request into an OpenCode session message."""
    body = await request.json()
    messages = body.get("messages", [])

    if not messages:
        raise HTTPException(400, "The request must contain at least one message")

    prompt_parts = []
    for message in messages:
        content = message.get("content", "")
        if isinstance(content, list):
            content = "\n".join(
                item.get("text", "") for item in content if item.get("type") == "text"
            )
        prompt_parts.append(f"{message.get('role', 'user')}: {content}")

    async with httpx.AsyncClient(timeout=120) as client:
        session_response = await client.post(
            f"{OPENCODE_SERVER_URL}/session",
            json={"title": "resume-agent request"},
        )
        if session_response.is_error:
            raise HTTPException(
                session_response.status_code, session_response.text
            )

        session_id = session_response.json()["id"]
        message_response = await client.post(
            f"{OPENCODE_SERVER_URL}/session/{session_id}/message",
            json={
                "model": {
                    "providerID": OPENCODE_PROVIDER_ID,
                    "modelID": OPENCODE_MODEL,
                },
                "parts": [{"type": "text", "text": "\n\n".join(prompt_parts)}],
            },
        )
        if message_response.is_error:
            raise HTTPException(message_response.status_code, message_response.text)

    response_data = message_response.json()
    text_parts = [
        part.get("text", "")
        for part in response_data.get("parts", [])
        if part.get("type") == "text"
    ]
    content = "\n".join(text_parts)

    return {
        "id": f"chatcmpl-{uuid.uuid4().hex}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": body.get("model", OPENCODE_MODEL),
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": content},
                "finish_reason": "stop",
            }
        ],
    }
