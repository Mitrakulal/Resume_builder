"""
Node for reading and parsing job description.
Extracts requirements and key information from JD.
"""

import json
import os
from dotenv import load_dotenv
from langchain_ollama import ChatOllama

from schemas.jd_requirements import JDRequirements

load_dotenv()

model = ChatOllama(
    model=os.getenv("OLLAMA_MODEL", "gemma4:e4b"),
    base_url=os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434"),
    temperature=0.1,
    format="json",
)




async def read_jd(state):
    """Read and parse job description."""
    jd_raw_text=state["jd_raw_text"]
    
    prompt = f"""Extract job requirements from this description and return as valid JSON:

{jd_raw_text}

Return JSON matching this structure:
{{"job_title": "...", "company": "...", "must_have_skills": [...], "nice_to_have_skills": [...], "experience_years": ..., "key_responsibilities": [...], "keywords": [...]}}

JSON:"""
    
    response = await model.ainvoke(prompt)
    
    # Parse JSON from the local model response, including markdown-wrapped JSON.
    try:
        content = response.content.strip()
        if content.startswith("```"):
            content = content.strip("`")
            if content.startswith("json"):
                content = content[4:].lstrip()
        try:
            data = json.loads(content)
        except json.JSONDecodeError:
            start = content.find("{")
            end = content.rfind("}")
            if start == -1 or end <= start:
                raise
            data = json.loads(content[start : end + 1])
        requirements = JDRequirements(**data)
    except (json.JSONDecodeError, ValueError) as e:
        # Fallback: create empty requirements if parsing fails
        print(f"Warning: Failed to parse JD requirements - {e}")
        requirements = JDRequirements(job_title="Unknown")
    
    return {
        "jd_requirements":requirements
        }
 