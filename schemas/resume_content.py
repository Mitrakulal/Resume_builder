"""
Pydantic model for generated resume content.
Defines the structure of final resume sections.
"""

from typing import List, Optional
from pydantic import BaseModel, Field
from schemas.candidate_profile import ExperienceItem, ProjectItem, EducationItem


class SkillCategory(BaseModel):
    category: str = Field(description="Category title, e.g. Languages, Frameworks & Libraries, Databases & Storage, Cloud & DevOps, Developer Tools")
    skills: List[str] = Field(description="List of relevant skills belonging to this category")


class ResumeContent(BaseModel):
    """Generated resume content sections."""
    professional_summary: Optional[str] = None
    experience_section: List[ExperienceItem] = Field(default_factory=list)
    projects_section: List[ProjectItem] = Field(default_factory=list)
    skills_section: List[SkillCategory] = Field(default_factory=list)
    education_section: List[EducationItem] = Field(default_factory=list)
    certifications_section: List[str] = Field(default_factory=list)
