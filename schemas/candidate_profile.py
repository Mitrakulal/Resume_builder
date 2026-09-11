"""
Pydantic model for candidate profile.
Defines the structure of master profile data.
"""

from pydantic import BaseModel, EmailStr,Field
from typing import  Optional

class PersonalInfo(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None

class CandidateProfile(BaseModel):
    personal_info: PersonalInfo
    professional_summary: Optional[str] = None
    experience: list[dict] = Field(default_factory=list)
    education: list[dict] = []
    skills: list[str] = []
    certifications: list[str] = []