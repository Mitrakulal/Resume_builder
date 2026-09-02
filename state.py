"""
ResumeAgentState TypedDict definition.
Defines the state structure for the LangGraph workflow.
"""

from typing import TypedDict, Optional, Any,Dict,List

class ResumeAgentState(TypedDict, total=False):
    """State structure for the resume agent workflow."""
    
    jd_raw_text:str
    profile_path:str
    
    jd_requirnment: dict[str,Any]
    
    candidate_profile:dict[str,Any]
    
    matched_items : List[Dict[str,Any]]
    
    reusume_content : Dict[str,Any]
    
    rendered_tex_path: str
    
    output_pdf_path:str
    
    error:Optional[str]
    
