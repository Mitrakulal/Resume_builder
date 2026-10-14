"""
Node for matching candidate skills to job requirements.
Identifies relevant experience and achievements.
"""
from schemas.matched_items import MatchedItems


async def match(state):
    """Match candidate profile to job description requirements."""
    
    jd_requirements=state["jd_requirements"]
    candidate_profile=state["candidate_profile"]
    
    jd_skills=[]
    jd_skills.extend(jd_requirements.must_have_skills)
    jd_skills.extend(jd_requirements.nice_to_have_skills)
    jd_skills.extend(jd_requirements.keywords)
    
    candidate_skills = []
    candidate_skills.extend(candidate_profile.skills)
    
    def normalize(value):
        return str(value).strip().lower()
        
    jd_set = {normalize(skill) for skill in jd_skills if str(skill).strip()}
    candidate_set = {normalize(skill) for skill in candidate_skills if str(skill).strip()}

    matched_skills = sorted(
        {skill for skill in candidate_skills if normalize(skill) in jd_set}
    )

    gap_areas = sorted(
        {skill for skill in jd_skills if normalize(skill) not in candidate_set}
    )

    matched_experience = []
    for experience in candidate_profile.experience:
        if isinstance(experience, dict):
            role = experience.get("role") or experience.get("title") or "Experience"
            description = experience.get("description") or " ".join(experience.get("bullets", []))
            experience_skills = experience.get("skills") or []
        else:
            role = getattr(experience, "role", "") or "Experience"
            description = getattr(experience, "description", "") or " ".join(getattr(experience, "bullets", []))
            experience_skills = getattr(experience, "skills", [])

        summary = f"{role}: {description}".strip()

        if not summary:
            continue

        if any(normalize(skill) in jd_set for skill in experience_skills) or any(normalize(skill) in summary.lower() for skill in jd_skills):
            matched_experience.append(summary)

    total_skills = max(len(jd_set), 1)
    relevance_score = round((len(matched_skills) / total_skills) * 100, 2)
    
    matched_items= MatchedItems(
        matched_skills=matched_skills,
        matched_experience=matched_experience,
        gap_areas=gap_areas,
        relevance_score=relevance_score,
    )
    return{"matched_items":matched_items}