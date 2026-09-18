"""
Node for reading and parsing job description.
Extracts requirements and key information from JD.
"""

import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

from schemas.jd_requirements import JDRequirements

load_dotenv()

model = ChatOpenAI(
    model=os.getenv("GEMMA_MODEL"),
    api_key=os.getenv("GEMMA_API_KEY"),
    base_url=os.getenv("GEMMA_BASE_URL"),
    temperature=0.2,
    max_completion_tokens=int(os.getenv("GEMMA_MAX_TOKENS", "2048")),
    use_responses_api=False,
)


async def read_jd(state):
    """Read and parse job description."""
    jd_raw_text = state["jd_raw_text"]
    structured_model = model.with_structured_output(JDRequirements)

    requirements = await structured_model.ainvoke(
        f"Extract the job requirements from this description:\n{jd_raw_text}"
    )

    return {"jd_requirements": requirements}
 