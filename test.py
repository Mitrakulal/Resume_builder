import asyncio
import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

from graph import graph
from schemas.jd_requirements import JDRequirements


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


async def main():
    await test_structured_output()

    result = await graph.ainvoke({
    "jd_raw_text": JD_TEXT,
    "profile_path": "master_profile.json"
    })
    print(result["resume_content"])


asyncio.run(main())