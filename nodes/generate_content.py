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
    You are an expert resume writer. Your job is to transform the candidate's raw profile into an ATS-friendly, tailored resume matching the output schema.

    CRITICAL INSTRUCTIONS:
    1. GENERATE TAILORED BULLETS:
       - The candidate profile contains raw descriptions, notes, and skills from their background.
       - Do NOT copy the raw text directly. Rewrite and synthesize 2 to 4 concise, high-impact bullet points ('bullets') for each included experience and project.
       - Tailor the phrasing, technologies, and achievements in each bullet to directly highlight relevance to the JOB REQUIREMENTS and MATCH RESULTS.
       - Start each bullet point with a strong past-tense action verb (e.g., "Architected", "Engineered", "Implemented", "Optimized", "Integrated").
    2. SELECTION & REFRAMING (NEVER LEAVE SECTIONS EMPTY):
       - ALWAYS include the candidate's strongest work: ensure experience_section and projects_section each contain at least 1 to 2 entries and maximum of 3 to 4.
       - Even if past work is not an exact 1:1 match with the job's subfield, do NOT drop it. Instead, reframe transferable engineering skills (e.g. backend systems, C++/Python development, model deployment, latency optimization, architecture) to demonstrate strong engineering capability.
    3. STRICT GROUNDING:
       - Ground all achievements strictly in the candidate's actual background. Do not hallucinate unmentioned companies, degrees, or tools.
    4. NO PLACEHOLDERS:
       - Populate real values from the profile, never placeholders.
    5. CLASSIFIED TECHNICAL SKILLS:
       - Output 'skills_section' as a list of SkillCategory items, each containing 'category' (e.g. "Languages", "Frameworks & Libraries", "Databases & Storage", "Cloud & DevOps", "Developer Tools") and 'skills' (List[str]).
       - Only include skills from the candidate profile, prioritizing those matching the job requirements.

    JOB REQUIREMENTS:
    {jd_requirements.model_dump_json(indent=2)}

    CANDIDATE PROFILE:
    {candidate_profile.model_dump_json(indent=2)}

    MATCH RESULTS:
    {matched_items.model_dump_json(indent=2)}
    """

    resume_content = await structured_model.ainvoke(prompt)

    return {
        "resume_content": resume_content
    }