import asyncio
from dotenv import load_dotenv


load_dotenv()

from nodes.load_profile import load_profile


state = {
    "profile_path": "master_profile.json"
}

result = asyncio.run(load_profile(state))

print(result)