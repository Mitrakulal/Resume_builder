"""
Pydantic model for job description requirements.
Defines the structure of parsed JD data.
"""

from pydantic import BaseModel,Field
from typing import List, Optional



class JDRequirements(BaseModel):
    """Parsed job description requirements."""
    job_title: str
    company: Optional[str] =None
    must_have_skills: list[str]=Field(default_factory=list)
    nice_to_have_skills: list[str]=Field(default_factory=list)
    experience_years: Optional[int] = None
    key_responsibilities: List[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
