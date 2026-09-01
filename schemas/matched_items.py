"""
Pydantic model for matched candidate items.
Represents skills and experiences matched to job requirements.
"""

from pydantic import BaseModel
from typing import List

class MatchedItems(BaseModel):
    """Matched items between candidate and job requirements."""
    matched_skills: List[str] = []
    matched_experience: List[str] = []
    gap_areas: List[str] = []
    relevance_score: float = 0.0
