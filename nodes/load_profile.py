"""
Node for loading candidate profile.
Reads master profile data.
"""
import json
from schemas.candidate_profile import CandidateProfile

async def load_profile(state):
    """Load candidate profile from master_profile.json."""
    profile_path=state["profile_path"]
    
    with open(profile_path,"r") as file:
        profile_data=json.load(file)
        
    candidate_profile=CandidateProfile(**profile_data)
    
    return {
        "candidate_profile": candidate_profile
    }
    
