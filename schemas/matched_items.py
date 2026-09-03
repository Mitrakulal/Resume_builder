"""
Pydantic model for matched candidate items.
Represents skills and experiences matched to job requirements.
"""

from pydantic import BaseModel,Field
from typing import List

class MatchedItems(BaseModel):
    """Matched items between candidate and job requirements."""
    matched_skills: List[str]= Field(default_factory=list)
    matched_experience: List[str] = Field(default_factory=list)
    gap_areas: List[str] = Field(default_factory=list)
    relevance_score: float = 0.0
