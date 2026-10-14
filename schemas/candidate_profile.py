from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, AliasChoices


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
    date: Optional[str] = Field(default=None, validation_alias=AliasChoices("date", "dates"))
    description: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    bullets: List[str] = Field(default_factory=list)


class ProjectItem(BaseModel):
    name: str
    technologies: Optional[str] = None
    date: Optional[str] = Field(default=None, validation_alias=AliasChoices("date", "dates", "year"))
    description: Optional[str] = None
    bullets: List[str] = Field(default_factory=list)


class EducationItem(BaseModel):
    institution: str = Field(default="", validation_alias=AliasChoices("institution", "school"))
    degree: str
    location: Optional[str] = None
    date: Optional[str] = Field(default=None, validation_alias=AliasChoices("date", "year"))
    details: Optional[str] = None


class CandidateProfile(BaseModel):
    personal_info: PersonalInfo
    professional_summary: Optional[str] = None
    experience: List[ExperienceItem] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    education: List[EducationItem] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
