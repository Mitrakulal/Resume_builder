/* Shared frontend types. These mirror the FastAPI schemas where possible. */

/* ------------------------------ Profile ----------------------------- */

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  links: string[];
}

export interface ExperienceItem {
  id?: string;
  role?: string;
  company?: string;
  location?: string | null;
  date?: string | null;
  dates?: string;
  description?: string | null;
  skills?: string[];
  bullets?: string[];
  /* Legacy / alias compatibility with older profile JSON. */
  title?: string;
  organization?: string;
  startDate?: string;
  endDate?: string;
  skillsUsed?: string[];
}

export interface ProjectItem {
  id?: string;
  name: string;
  technologies?: string | null;
  date?: string | null;
  description?: string | null;
  skills?: string[];
  bullets?: string[];
  skillsUsed?: string[];
  link?: string;
}

export interface EducationItem {
  id?: string;
  institution: string;
  degree: string;
  location?: string | null;
  date?: string | null;
  details?: string | null;
  /* Legacy / alias compatibility with older profile JSON. */
  school?: string;
  year?: string;
  startDate?: string;
  endDate?: string;
}

export interface CandidateProfile {
  personal_info: ContactInfo;
  professional_summary?: string | null;
  experience: ExperienceItem[];
  projects?: ProjectItem[];
  education: EducationItem[];
  skills: string[];
  certifications?: string[];
}

/* --------------------------- Applications --------------------------- */

export type ApplicationStatus = "pipeline" | "matched" | "failed";

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pipeline: "Pipeline running",
  matched: "Resume ready",
  failed: "Failed",
};

export interface ApplicationSummary {
  jobTitle?: string | null;
  requiredSkillsCount?: number | null;
  matchedSkillsCount?: number | null;
  missingSkillsCount?: number | null;
}

export interface Application {
  /** Local record id. Currently the same as the backend job id. */
  id: string;
  /** Backend job id used for SSE and PDF requests. */
  jobId: string;
  role: string;
  company: string;
  jdText: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  completedNodes: string[];
  pdfUrl?: string;
  summary: ApplicationSummary;
  error?: string;
}

export function applicationRole(app: Application): string {
  const title = app.summary.jobTitle?.trim() || app.role?.trim() || "";
  if (!title || title.toLowerCase() === "unknown") {
    return "Tailored application";
  }
  return title;
}

export function applicationCompany(app: Application): string {
  const company = app.company?.trim() || "";
  if (!company || company.toLowerCase() === "unknown") {
    return "";
  }
  return company;
}

/* --------------------------- Backend results ------------------------ */

export interface JDRequirements {
  job_title?: string | null;
  company?: string | null;
  must_have_skills: string[];
  nice_to_have_skills: string[];
  experience_years?: number | null;
  key_responsibilities: string[];
  keywords: string[];
}

export interface MatchedItems {
  matched_skills: string[];
  matched_experience: string[];
  gap_areas: string[];
  relevance_score: number;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface ResumeContent {
  professional_summary?: string | null;
  experience_section: ExperienceItem[];
  projects_section: ProjectItem[];
  skills_section: SkillCategory[];
  education_section: EducationItem[];
  certifications_section: string[];
}

/** Shape returned by a future GET /api/tailor/{job_id}/result endpoint. */
export interface TailorResult {
  job_id: string;
  status?: string;
  /** Either a URL or the backend filesystem path may be returned by the endpoint. */
  pdf_url?: string | null;
  pdf_path?: string | null;
  jd_requirements?: JDRequirements | null;
  matched_items?: MatchedItems | null;
  resume_content?: ResumeContent | null;
  error?: string | null;
}
