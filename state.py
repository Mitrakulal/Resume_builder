"""
ResumeAgentState TypedDict definition.
Defines the state structure for the LangGraph workflow.
"""

from typing import TypedDict, Optional, Any,Dict,List
from schemas.candidate_profile import  CandidateProfile
from schemas.jd_requirements import JDRequirements
from schemas.matched_items import MatchedItems
from schemas.resume_content import ResumeContent

class ResumeAgentState(TypedDict, total=False):
    """State structure for the resume agent workflow."""
    
    jd_raw_text:str
    profile_path:str
    
    jd_requirements: JDRequirements
    candidate_profile: CandidateProfile
    matched_items : MatchedItems
    resume_content : ResumeContent
    
    rendered_tex_path: str
    output_pdf_path:str
    
    error:Optional[str]
    
