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
from sse_starlette.sse import EventSourceResponse

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

    initial_state={
        "jd_raw_text":jd_text,
        "profile_path":str(PROFILE_PATH),
    }

    try:

        await event_queue.put({
            "event":"start",
            "data":json.dumps({"job_id":job_id,"message":"Starting resume tailoring pipline..."})
        })

        async for chunk in graph.astream(initial_state):
            for node_name , node_output in chunk.items():
                logger.info(f"[{job_id}Node completed:{node_name}]")
                summary_data ={"node":node_name,"status":"completed"}

                if node_name == "read_jd" and "jd_requirements" in node_output:
                    reqs = node_output["jd_requirements"]
                    summary_data["details"] = {
                        "job_title": getattr(reqs, "job_title", "Unknown"),
                        "required_skills_count": len(getattr(reqs, "required_skills", [])),
                    }
                elif node_name == "match" and "matched_items" in node_output:
                    matched = node_output["matched_items"]
                    summary_data["details"] = {
                        "matched_skills": len(getattr(matched, "matched_skills", [])),
                        "missing_skills": len(getattr(matched, "missing_skills", [])),
                    }
                elif node_name == "compile" and "output_pdf_path" in node_output:
                    job["pdf_path"] = node_output["output_pdf_path"]
                    summary_data["pdf_url"] = f"/api/tailor/{job_id}/pdf"

                # send event to the frontend
                await event_queue.put({
                    "event":"node_progress",
                    "data":json.dumps(summary_data),
                })
    

        job["status"] = "completed"
        await event_queue.put({
            "event":"completed",
            "data":json.dumps({
                "job_id":job_id,
                "status":"success",
                "pdf_url":f"/api/tailor/{job_id}/pdf",
                "message":"Resume generation and compilation complete!"
                })
        })
    except Exception as e:
        logger.exception(f"[{job_id} pipline error : {e}]")
        job["status"]="failed"
        await event_queue.put({
            "event":"error",
            "data":json.dumps({"job_id":job_id,"error":str(e)})
        })
    finally:
        await event_queue.put(None)


@app.post("/api/tailor",response_model=JobStartResponse,tags=["Tailor"])
async def start_tailor_job(req:TailorRequest,background_tasks:BackgroundTasks):

    if not req.jd_text.strip():
        raise HTTPException(status_code=400,detail="JD text cannot be empty")

    job_id=str(uuid.uuid4())[:8]
    jobs[job_id]={
        "status":"running",
        "events":asyncio.Queue(),
        "pdf_path":None
    }

    background_tasks.add_task(run_pipline_worker,job_id=job_id,jd_text=req.jd_text)

    return JobStartResponse(
        job_id=job_id,
        status="running",
        message="Tailoring pipline started"
    )

@app.get("/api/tailor/{job_id}/stream",tags=["Tailor"])
async def stream_job_progress(job_id:str):
    job=jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404,detail="Job not found")
        
    async def event_generator():
        queue:asyncio.Queue=job["events"]
        while True:
            event=await queue.get()
            if event is None:
                break
            yield event

    return EventSourceResponse(event_generator())

@app.get("/api/tailor/{job_id}/pdf", tags=["Tailor"])
async def get_compiled_pdf(job_id: str):
    """
    Streams the generated PDF file to the browser.
    """
    job = jobs.get(job_id)
    pdf_path = None

    if job and job.get("pdf_path"):
        pdf_path = Path(job["pdf_path"])
    else:
        # Fallback to output/resume.pdf
        default_pdf = OUTPUT_DIR / "resume.pdf"
        if default_pdf.exists():
            pdf_path = default_pdf

    if not pdf_path or not pdf_path.exists():
        raise HTTPException(status_code=404, detail="Compiled PDF not found.")

    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=f"resume_{job_id}.pdf"
    )

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "resume-agent-api"}
