"""
Node for generating optimized resume content.
Creates tailored resume sections based on match results.
"""
import json
import os

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

from schemas.resume_content import ResumeContent

load_dotenv(override=True)

model = ChatOpenAI(
    model=os.getenv("MODEL_NAME") or os.getenv("OPENAI_MODEL") or os.getenv("GEMMA_MODEL", "gpt-4o"),
    api_key=os.getenv("OPENAI_API_KEY") or os.getenv("GEMMA_API_KEY"),
    base_url=os.getenv("CLOUD_ENDPOINT") or os.getenv("OPENAI_BASE_URL") or os.getenv("GEMMA_BASE_URL"),
    temperature=0.2,
    max_completion_tokens=int(os.getenv("GEMMA_MAX_TOKENS", "2048")),
    use_responses_api=False if os.getenv("GEMMA_BASE_URL") else True,
)
async def generate_content(state):
    """Generate optimized resume content."""
    
    jd_requirements = state["jd_requirements"]
    candidate_profile = state["candidate_profile"]
    matched_items = state["matched_items"]
    
    structured_model = model.with_structured_output(ResumeContent)
    prompt = f"""
    You are an expert resume generator. Your task is to extract information from the CANDIDATE PROFILE and format it into the output schema.
    
    CRITICAL RULES:
    1. EXCLUDE ENTIRELY any jobs, skills, or certifications from the candidate profile that are completely unrelated to the job requirements.
    2. NEVER invent, hallucinate, or add new skills (like AWS) if they are not explicitly listed in the CANDIDATE PROFILE.
    3. NO PLACEHOLDERS: Do not write things like 'role_title_filtered'. Actually write the real job title, company, and description from the candidate profile.
    4. Format each item in the experience_section list as a single string combining the role, company, dates, and description.

    JOB REQUIREMENTS:
    {jd_requirements.model_dump_json(indent=2)}

    CANDIDATE PROFILE:
    {candidate_profile.model_dump_json(indent=2)}

    MATCH RESULTS:
    {matched_items.model_dump_json(indent=2)}

    Return the filtered and concise resume content matching the JSON schema.
    """
    resume_content = await structured_model.ainvoke(prompt)

    return {
        "resume_content": resume_content
    }