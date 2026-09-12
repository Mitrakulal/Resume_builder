import asyncio
from dotenv import load_dotenv

load_dotenv()

from graph import graph


async def main():
    result = await graph.ainvoke({
        "profile_path": "master_profile.json"
    })
    print(result)


asyncio.run(main())