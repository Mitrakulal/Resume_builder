from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

class PersonalInfo(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None
    links: List[str] = Field(default_factory=list)

class ExperienceItem(BaseModel):
    company: str
    role: str
    location: Optional[str] = None
    date: Optional[str] = None
    bullets: List[str] = Field(default_factory=list)

class ProjectItem(BaseModel):
    name: str
    technologies: Optional[str] = None
    date: Optional[str] = None
    bullets: List[str] = Field(default_factory=list)

class EducationItem(BaseModel):
    institution: str
    degree: str
    location: Optional[str] = None
    date: Optional[str] = None
    details: Optional[str] = None

class CandidateProfile(BaseModel):
    personal_info: PersonalInfo
    professional_summary: Optional[str] = None
    experience: List[ExperienceItem] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    education: List[EducationItem] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
