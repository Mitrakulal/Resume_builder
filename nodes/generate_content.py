"""
Node for generating optimized resume content.
Creates tailored resume sections based on match results.
"""
import json
import os

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

from schemas.resume_content import ResumeContent

load_dotenv()

model = ChatOpenAI(
    model=os.getenv("GEMMA_MODEL"),
    api_key=os.getenv("GEMMA_API_KEY"),
    base_url=os.getenv("GEMMA_BASE_URL"),
    temperature=0.2,
    max_completion_tokens=int(os.getenv("GEMMA_MAX_TOKENS", "2048")),
    use_responses_api=False,
)
async def generate_content(state):
    """Generate optimized resume content."""
    
    jd_requirements = state["jd_requirements"]
    candidate_profile = state["candidate_profile"]
    matched_items = state["matched_items"]
    
    structured_model = model.with_structured_output(ResumeContent)
    prompt = f"""
    Create tailored resume content for this job.

    Use only facts from the candidate profile.
    Do not invent companies, dates, technologies, achievements, or metrics.
    Do not add skills that are not present in the candidate profile.
    Prioritize the candidate's skills that match the job requirements.
    Rewrite existing information clearly and professionally.

    JOB REQUIREMENTS:
    {jd_requirements.model_dump_json(indent=2)}

    CANDIDATE PROFILE:
    {candidate_profile.model_dump_json(indent=2)}

    MATCH RESULTS:
    {matched_items.model_dump_json(indent=2)}

    Return concise, professional resume content.
    """
    resume_content = await structured_model.ainvoke(prompt)

    return {
        "resume_content": resume_content
    }