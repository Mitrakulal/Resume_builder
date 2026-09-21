import asyncio
import os
import json
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

from graph import graph
from nodes.load_profile import load_profile
from nodes.match import match
from schemas.jd_requirements import JDRequirements
from schemas.resume_content import ResumeContent


JD_TEXT = """
We are looking for a Python backend developer.
Required skills include Python and REST APIs.
Experience with FastAPI is preferred.
"""


async def test_structured_output():
    """Check whether the configured gateway supports LangChain structured output."""
    model = ChatOpenAI(
        model=os.getenv("GEMMA_MODEL"),
        api_key=os.getenv("GEMMA_API_KEY"),
        base_url=os.getenv("GEMMA_BASE_URL"),
        temperature=0.1,
        max_completion_tokens=int(os.getenv("GEMMA_MAX_TOKENS", "2048")),
        timeout=60,
        use_responses_api=False,
    )
    structured_model = model.with_structured_output(JDRequirements)

    try:
        result = await structured_model.ainvoke(
            f"Extract the job requirements from this description:\n{JD_TEXT}"
        )
        print("Structured output succeeded:")
        print(result)
        return True
    except Exception as error:
        print("Structured output failed:")
        print(f"{type(error).__name__}: {error}")
        return False


async def test_resume_content_output():
    """Check whether Gemma can complete the larger ResumeContent response."""
    model = ChatOpenAI(
        model=os.getenv("GEMMA_MODEL"),
        api_key=os.getenv("GEMMA_API_KEY"),
        base_url=os.getenv("GEMMA_BASE_URL"),
        temperature=0.2,
        max_completion_tokens=int(os.getenv("GEMMA_MAX_TOKENS", "2048")),
        timeout=180,
        use_responses_api=False,
    )

    state = {
        "jd_requirements": JDRequirements(
            job_title="Python Backend Developer",
            must_have_skills=["Python", "REST APIs"],
            nice_to_have_skills=["FastAPI"],
            keywords=["Python", "backend developer", "REST APIs", "FastAPI"],
        ),
        "profile_path": "master_profile.json",
    }
    state.update(await load_profile(state))
    state.update(await match(state))

    structured_model = model.with_structured_output(ResumeContent)
    prompt = f"""
Create concise tailored resume content for this job.

Use only facts from the candidate profile. Do not invent information.
Return no more than 2 experience entries, 4 skills entries, 1 education entry,
and 2 certification entries.

JOB REQUIREMENTS:
{state['jd_requirements'].model_dump_json(indent=2)}

CANDIDATE PROFILE:
{state['candidate_profile'].model_dump_json(indent=2)}

MATCH RESULTS:
{state['matched_items'].model_dump_json(indent=2)}
"""

    try:
        result = await structured_model.ainvoke(prompt)
        print("ResumeContent structured output succeeded:")
        print(json.dumps(result.model_dump(), indent=4))
        return True
    except Exception as error:
        print("ResumeContent structured output failed:")
        print(f"{type(error).__name__}: {error}")
        return False


async def main():
    await test_structured_output()
    await test_resume_content_output()

    result = await graph.ainvoke({
    "jd_raw_text": JD_TEXT,
    "profile_path": "master_profile.json"
    })
    print(json.dumps(result["resume_content"].model_dump(), indent=4))
    print(f"Rendered LaTeX: {result['rendered_tex_path']}")
    print(f"Generated PDF: {result['output_pdf_path']}")


asyncio.run(main())