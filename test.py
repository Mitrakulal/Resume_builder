# import asyncio
# import os
# import json
# from dotenv import load_dotenv
# from langchain_openai import ChatOpenAI

# load_dotenv()

# from graph import graph
# from nodes.load_profile import load_profile
# from nodes.match import match
# from schemas.jd_requirements import JDRequirements
# from schemas.resume_content import ResumeContent


# JD_TEXT = """
# We are looking for a Python backend developer.
# Required skills include Python and REST APIs.
# Experience with FastAPI is preferred.
# """


# async def test_structured_output():
#     """Check whether the configured gateway supports LangChain structured output."""
#     model = ChatOpenAI(
#         model=os.getenv("GEMMA_MODEL"),
#         api_key=os.getenv("GEMMA_API_KEY"),
#         base_url=os.getenv("GEMMA_BASE_URL"),
#         temperature=0.1,
#         max_completion_tokens=int(os.getenv("GEMMA_MAX_TOKENS", "2048")),
#         timeout=60,
#         use_responses_api=False,
#     )
#     structured_model = model.with_structured_output(JDRequirements)

#     try:
#         result = await structured_model.ainvoke(
#             f"Extract the job requirements from this description:\n{JD_TEXT}"
#         )
#         print("Structured output succeeded:")
#         print(result)
#         return True
#     except Exception as error:
#         print("Structured output failed:")
#         print(f"{type(error).__name__}: {error}")
#         return False


# async def test_resume_content_output():
#     """Check whether Gemma can complete the larger ResumeContent response."""
#     model = ChatOpenAI(
#         model=os.getenv("GEMMA_MODEL"),
#         api_key=os.getenv("GEMMA_API_KEY"),
#         base_url=os.getenv("GEMMA_BASE_URL"),
#         temperature=0.2,
#         max_completion_tokens=int(os.getenv("GEMMA_MAX_TOKENS", "2048")),
#         timeout=180,
#         use_responses_api=False,
#     )

#     state = {
#         "jd_requirements": JDRequirements(
#             job_title="Python Backend Developer",
#             must_have_skills=["Python", "REST APIs"],
#             nice_to_have_skills=["FastAPI"],
#             keywords=["Python", "backend developer", "REST APIs", "FastAPI"],
#         ),
#         "profile_path": "master_profile.json",
#     }
#     state.update(await load_profile(state))
#     state.update(await match(state))

#     structured_model = model.with_structured_output(ResumeContent)
#     prompt = f"""
# Create concise tailored resume content for this job.

# Use only facts from the candidate profile. Do not invent information.
# Return no more than 2 experience entries, 4 skills entries, 1 education entry,
# and 2 certification entries.

# JOB REQUIREMENTS:
# {state['jd_requirements'].model_dump_json(indent=2)}

# CANDIDATE PROFILE:
# {state['candidate_profile'].model_dump_json(indent=2)}

# MATCH RESULTS:
# {state['matched_items'].model_dump_json(indent=2)}
# """

#     try:
#         result = await structured_model.ainvoke(prompt)
#         print("ResumeContent structured output succeeded:")
#         print(json.dumps(result.model_dump(), indent=4))
#         return True
#     except Exception as error:
#         print("ResumeContent structured output failed:")
#         print(f"{type(error).__name__}: {error}")
#         return False


# async def main():
#     await test_structured_output()
#     await test_resume_content_output()

#     result = await graph.ainvoke({
#     "jd_raw_text": JD_TEXT,
#     "profile_path": "master_profile.json"
#     })
#     print(json.dumps(result["resume_content"].model_dump(), indent=4))
#     print(f"Rendered LaTeX: {result['rendered_tex_path']}")
#     print(f"Generated PDF: {result['output_pdf_path']}")


# asyncio.run(main())


"""
FastAPI Server for Resume Agent Pipeline.
Handles profile CRUD, LangGraph pipeline runs, SSE streaming, and PDF serving.
"""

import asyncio
import json
import logging
import uuid
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

# Import your existing LangGraph graph and CandidateProfile schema
from graph import graph
from schemas.candidate_profile import CandidateProfile

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("resume_api")

app = FastAPI(
    title="Resume Agent API",
    description="Backend API powering resume tailoring, LangGraph workflow streaming, and profile management.",
    version="1.0.0",
)

# ----------------------------------------------------
# 1. CORS Setup (Crucial for React connection)
# ----------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from localhost:5173
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_ROOT = Path(__file__).resolve().parent
PROFILE_PATH = PROJECT_ROOT / "master_profile.json"
OUTPUT_DIR = PROJECT_ROOT / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

# In-memory dictionary tracking running jobs
# Structure: { job_id: { "status": "running", "events": asyncio.Queue, "pdf_path": str } }
jobs: Dict[str, Dict[str, Any]] = {}


# ----------------------------------------------------
# 2. Request Models
# ----------------------------------------------------
class TailorRequest(BaseModel):
    jd_text: str


class JobStartResponse(BaseModel):
    job_id: str
    status: str
    message: str


# ----------------------------------------------------
# 3. Profile Endpoints
# ----------------------------------------------------
@app.get("/api/profile", tags=["Profile"])
async def get_profile():
    """Reads and returns the current master_profile.json."""
    if not PROFILE_PATH.exists():
        raise HTTPException(status_code=404, detail="Master profile not found.")
    try:
        content = PROFILE_PATH.read_text(encoding="utf-8")
        return json.loads(content)
    except Exception as e:
        logger.error(f"Failed to read master_profile.json: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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


# ----------------------------------------------------
# 4. Pipeline Execution & SSE Streaming
# ----------------------------------------------------
async def run_pipeline_worker(job_id: str, jd_text: str):
    """
    Background worker that runs the LangGraph workflow and
    pushes node-by-node updates into the job's event queue.
    """
    job = jobs.get(job_id)
    if not job:
        return

    event_queue: asyncio.Queue = job["events"]

    initial_state = {
        "jd_raw_text": jd_text,
        "profile_path": str(PROFILE_PATH),
    }

    try:
        # 1. Notify client that pipeline has started
        await event_queue.put({
            "event": "start",
            "data": json.dumps({"job_id": job_id, "message": "Starting resume tailoring pipeline..."})
        })

        # 2. LangGraph astream() executes nodes sequentially and yields each node's output
        async for chunk in graph.astream(initial_state):
            for node_name, node_output in chunk.items():
                logger.info(f"[{job_id}] Node completed: {node_name}")
                summary_data = {"node": node_name, "status": "completed"}

                # Capture useful metadata from nodes to show in the UI
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

                # Send this event to the SSE stream
                await event_queue.put({
                    "event": "node_progress",
                    "data": json.dumps(summary_data)
                })

        # 3. Mark job as complete
        job["status"] = "completed"
        await event_queue.put({
            "event": "complete",
            "data": json.dumps({
                "job_id": job_id,
                "status": "success",
                "pdf_url": f"/api/tailor/{job_id}/pdf",
                "message": "Resume generation and compilation complete!"
            })
        })

    except Exception as e:
        logger.exception(f"[{job_id}] Pipeline error: {e}")
        job["status"] = "failed"
        await event_queue.put({
            "event": "error",
            "data": json.dumps({"job_id": job_id, "error": str(e)})
        })
    finally:
        # None signals to the SSE generator that the stream is finished
        await event_queue.put(None)


@app.post("/api/tailor", response_model=JobStartResponse, tags=["Tailor"])
async def start_tailor_job(req: TailorRequest, background_tasks: BackgroundTasks):
    """
    Starts a tailoring job in the background and returns a job_id immediately.
    """
    if not req.jd_text.strip():
        raise HTTPException(status_code=400, detail="Job description text cannot be empty.")

    job_id = str(uuid.uuid4())[:8]
    jobs[job_id] = {
        "status": "running",
        "events": asyncio.Queue(),
        "pdf_path": None,
    }

    # Start the worker task in the background so this request returns in ~2ms
    background_tasks.add_task(run_pipeline_worker, job_id=job_id, jd_text=req.jd_text)

    return JobStartResponse(
        job_id=job_id,
        status="running",
        message="Tailoring job started. Connect to SSE stream for live updates."
    )


@app.get("/api/tailor/{job_id}/stream", tags=["Tailor"])
async def stream_job_progress(job_id: str):
    """
    SSE stream endpoint. The frontend's EventSource listens here to receive
    live updates as each node (read_jd -> match -> generate -> render -> compile) runs.
    """
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    async def event_generator():
        queue: asyncio.Queue = job["events"]
        while True:
            event = await queue.get()
            if event is None:
                break
            yield event

    return EventSourceResponse(event_generator())


# ----------------------------------------------------
# 5. PDF Download & Preview
# ----------------------------------------------------
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


# ----------------------------------------------------
# 6. Health Check
# ----------------------------------------------------
@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "resume-agent-api"}
