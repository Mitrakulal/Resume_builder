"""
Pydantic model for candidate profile.
Defines the structure of master profile data.
"""

from pydantic import BaseModel, EmailStr
from typing import List, Optional

class CandidateProfile(BaseModel):
    """Candidate profile information."""
    name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None
    professional_summary: Optional[str] = None
    experience: List[dict] = []
    education: List[dict] = []
    skills: List[str] = []
    certifications: List[str] = []
