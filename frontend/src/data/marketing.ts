export interface Faq {
  q: string;
  a: string;
}

export const faqs: Faq[] = [
  {
    q: "Does it invent experience to make me look better?",
    a: "The generation prompt is constrained to your master profile, and the match node reports the skills it could and could not find. Automated claim-by-claim verification is not implemented yet, so review the generated PDF before sending it. Treat the output as a strong first draft, not a finished application.",
  },
  {
    q: "How do I give it a job description?",
    a: "Paste the text into the new application form. The current build does not import job links or PDFs; those would be separate extraction steps before the pipeline can run.",
  },
  {
    q: "What does the pipeline actually do?",
    a: "Six LangGraph nodes run in order: read_jd extracts requirements, load_profile reads master_profile.json, match compares your skills, generate_content writes tailored sections, render fills the LaTeX template, and compile runs pdflatex. The frontend streams the real node events over SSE.",
  },
  {
    q: "Where does my data go?",
    a: "Your profile is saved by the backend to master_profile.json. Applications and the submitted job descriptions are stored in this browser's localStorage. Resume content is generated through the LLM provider configured in the backend .env. Job state is held in memory by FastAPI and is lost on restart.",
  },
  {
    q: "Can I edit the generated resume?",
    a: "Edit the master profile and run the pipeline again. An inline resume editor is not part of this build yet; the current output is a compiled PDF.",
  },
  {
    q: "Why is the match breakdown sometimes missing?",
    a: "The current backend streams node completion events with limited summary fields. The detailed result endpoint (GET /api/tailor/{job_id}/result) is planned; the frontend is already built to render jd_requirements, matched_items and resume_content when it becomes available.",
  },
];
