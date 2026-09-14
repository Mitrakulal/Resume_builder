import asyncio
from dotenv import load_dotenv

load_dotenv()

from graph import graph


async def main():
    result = await graph.ainvoke({
    "jd_raw_text": """
    We are looking for a Python backend developer.
    Required skills include Python and REST APIs.
    Experience with FastAPI is preferred.
    """,
    "profile_path": "master_profile.json"
    })
    print(result)


asyncio.run(main())