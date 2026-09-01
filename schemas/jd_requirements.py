"""
Pydantic model for job description requirements.
Defines the structure of parsed JD data.
"""

from pydantic import BaseModel
from typing import List, Optional

class JDRequirements(BaseModel):
    """Parsed job description requirements."""
    job_title: str
    company: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    experience_years: Optional[int] = None
    key_responsibilities: List[str] = []
