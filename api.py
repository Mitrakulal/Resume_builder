from math import exp
from ctypes.wintypes import tagRECT
from test import PROJECT_ROOT
from pydantic.v1.utils import in_ipython
import imp
import asyncio
import json
import logging
import uuid
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import BackgroundTasks,FastAPI,HTTPException
from  fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from see_starlette.sse import EventSourceResponse

from graph import graph
from schemas.candidate_profile import CandidateProfile

logging.basicConfig(level=logging.INFO)
logger=logging.getLogger("resume_api")

app=FastAPI(
    title="Resume Agent API",
    description="Backend API powering resume tailoring, LangGraph workflow streaming, and profile management.",
    version="1.0.0"
)

# 1. cors setup 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_ROOT = Path(__file__).resolve().parent
PROFILE_PATH=PROJECT_ROOT/"master_profile.json"
OUTPUT_DIR=PROJECT_ROOT/"output"
OUTPUT_DIR.mkdir(exist_ok=True)

# IN-memory dictionary tracking running jobs
# Structure: { job_id: { "status": "running", "events": asyncio.Queue, "pdf_path": str } }
jobs: Dict[str, Dict[str, Any]] = {}


# 2 request models

class TailorRequest(BaseModel):
    jd_text:str
    
class JobStartResponse(BaseModel):
    job_id:str
    status:str
    message:str

# 3. Profile Endpoints

@app.get("/api/profile",tags=["profile"])
async def get_profile():

    if  not PROFILE_PATH.exists():
        raise HTTPException(status_code=404, detail="Master profile not found")
    try:
        content=PROFILE_PATH.read_text(encoding="utf-8")
        return json.load(content)
    except Exception as e:
        logger.error(f"Failed to read the master_profile.json{e}")
        raise HTTPException(status_code=500,detail=str(e))

@app.post("/api/profile", tags=["Profile"])
async def save_profile(profile_data: Dict[str, Any]):
    """
    Validates user JSON against the CandidateProfile Pydantic schema,
    then saves it cleanly to master_profile.json.
    """
    try:
        # Validate data matches your Pydantic schema
        validated = CandidateProfile.model_validate(profile_data)
        PROFILE_PATH.write_text(
            json.dumps(validated.model_dump(), indent=2),
            encoding="utf-8",
        )
        return {"status": "success", "message": "Master profile saved successfully."}
    except Exception as e:
        logger.error(f"Profile validation failed: {e}")
        raise HTTPException(status_code=422, detail=f"Invalid profile schema: {str(e)}")

#4 pipline execution & see streaming 

async def run_pipline_worker(job_id : str, jd_text: str):

    job=jobs.get(job_id)
    if not job:
        return

    event_queue=asyncio.Queue=job["events"]