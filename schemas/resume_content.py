"""
Pydantic model for generated resume content.
Defines the structure of final resume sections.
"""

from pydantic import BaseModel,Field
from typing import List, Optional
from schemas.candidate_profile import ExperienceItem, ProjectItem, EducationItem

class ResumeContent(BaseModel):
    """Generated resume content sections."""
    professional_summary: Optional[str] = None
    experience_section: List[ExperienceItem] = Field(default_factory=list)
    projects_section: List[ProjectItem] = Field(default_factory=list)
    skills_section: List[str] = Field(default_factory=list)
    education_section: List[EducationItem] = Field(default_factory=list)
    certifications_section: List[str] = Field(default_factory=list)
