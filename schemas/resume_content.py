"""
Pydantic model for generated resume content.
Defines the structure of final resume sections.
"""

from pydantic import BaseModel
from typing import List, Optional

class ResumeContent(BaseModel):
    """Generated resume content sections."""
    professional_summary: str
    experience_section: List[str] = []
    skills_section: List[str] = []
    education_section: List[str] = []
    certifications_section: List[str] = []
