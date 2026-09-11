"""
Node for loading candidate profile.
Reads master profile data.
"""
import json
from schemas.candidate_profile import CandidateProfile
from pydantic import ValidationError

async def load_profile(state):
    """Load candidate profile from master_profile.json."""
    profile_path=state["profile_path"]
    try:
        with open(profile_path,"r") as file:
            profile_data=json.load(file)
        
        candidate_profile=CandidateProfile(**profile_data)
   
    except FileNotFoundError as error:
        return {"error": f"Profile file not found: {error}"}

    except json.JSONDecodeError as error:
        return {"error": f"Invalid JSON in profile file: {error}"}

    except ValidationError as error:
        return {"error": f"Invalid profile structure: {error}"}
    
    return {
        "candidate_profile": candidate_profile
    }
    
