export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  github?: string;
  linkedin?: string;
  targetTitle?: string;
}

export interface BulletItem {
  id: string;
  prefix?: string;
  text: string;
  checked: boolean;
  skills?: string[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  dates: string;
  location?: string;
  checked: boolean;
  bullets: BulletItem[];
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  location: string;
  gpa?: string;
  year: string;
  checked: boolean;
}

export interface AwardItem {
  id: string;
  title: string;
  organization: string;
  year: string;
  checked: boolean;
}

export interface CandidateProfile {
  personal_info: PersonalInfo;
  professional_summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  awards: AwardItem[];
  skills: string[];
}

export interface ResumeRecord {
  id: string;
  title: string;
  targetRole: string;
  targetCompany: string;
  matchScore: number;
  lastEdited: string;
  jdText: string;
}

// User's actual profile data from their Teal screenshot
export const MITRA_PROFILE: CandidateProfile = {
  personal_info: {
    name: "Mitra Kulal",
    email: "kulalmitra@gmail.com",
    phone: "9360874181",
    location: "Udupi, Karnataka",
    github: "github.com/Mitrakulal",
    targetTitle: "AI / ML & Backend Engineer",
  },
  professional_summary:
    "AI/ML engineering student specialising in agentic systems, retrieval-augmented generation, and local LLM infrastructure. Shipped a production RAG system for a live client. Seeking an AI/ML or backend engineering internship.",
  experience: [
    {
      id: "exp-1",
      company: "mattrlabs — AI Hardware Studio",
      role: "AI/ML Engineer, Contract — Production RAG Knowledge Assistant",
      dates: "01/2026 - Present",
      location: "Remote",
      checked: true,
      bullets: [
        {
          id: "b1",
          prefix: "Deployment:",
          text: "Shipped a client-facing RAG assistant answering live product, service, and pricing queries.",
          checked: true,
          skills: ["RAG", "LLMs", "FastAPI"],
        },
        {
          id: "b2",
          prefix: "Retrieval:",
          text: "Built a ChromaDB vector store with section-aware chunking and nomic-embed-text embeddings for source-attributed answers.",
          checked: true,
          skills: ["ChromaDB", "Embeddings", "Vector Search"],
        },
        {
          id: "b3",
          prefix: "Reliability:",
          text: "Added metadata-based routing and an LLM-judged fallback, replacing hardcoded confidence thresholds.",
          checked: true,
          skills: ["Python", "Evaluation", "Routing"],
        },
        {
          id: "b4",
          prefix: "Infrastructure:",
          text: "Served via FastAPI, deployed on a Mac Mini behind a secured Cloudflare Tunnel.",
          checked: true,
          skills: ["FastAPI", "Cloudflare", "Linux"],
        },
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.E. in Artificial Intelligence and Machine Learning",
      school: "Sahyadri College of Engineering and Management",
      location: "Mangaluru, Karnataka",
      gpa: "GPA: 8.75 / 10.0",
      year: "01/2026",
      checked: true,
    },
  ],
  awards: [
    {
      id: "aw-1",
      title: "2nd Place, TechSprint 2025 Hackathon",
      organization: "Google Developer Groups on Campus, SCEM",
      year: "01/2025",
      checked: true,
    },
    {
      id: "aw-2",
      title: "Consolation Award, AARAMBH 2025 entrepreneurship summit",
      organization: "Incub8, NITK Surathkal",
      year: "01/2025",
      checked: true,
    },
    {
      id: "aw-3",
      title: "12th Nationally, Techfest 2024 robotics competition",
      organization: "IIT Bombay",
      year: "01/2024",
      checked: true,
    },
  ],
  skills: [
    "Python",
    "FastAPI",
    "LangGraph",
    "RAG",
    "ChromaDB",
    "Vector Embeddings",
    "REST APIs",
    "Docker",
    "PostgreSQL",
    "Linux",
    "Git",
  ],
};

export const INITIAL_RESUMES: ResumeRecord[] = [
  {
    id: "res-1",
    title: "AI/ML Engineer — Production RAG",
    targetRole: "AI/ML Engineer",
    targetCompany: "mattrlabs",
    matchScore: 82,
    lastEdited: "09/24/2026",
    jdText:
      "We are looking for an AI/ML Engineer experienced in building RAG knowledge systems, vector embeddings, and backend services with Python and FastAPI.",
  },
  {
    id: "res-2",
    title: "Python Backend Developer",
    targetRole: "Backend Developer",
    targetCompany: "Acme Corp",
    matchScore: 78,
    lastEdited: "09/21/2026",
    jdText:
      "Looking for a Python developer proficient in FastAPI, REST APIs, PostgreSQL database schema design, and Docker containerization.",
  },
];

export function buildLatexSource(profile: CandidateProfile): string {
  const p = profile.personal_info;
  const exp = profile.experience.find((e) => e.checked);
  const activeBullets = exp ? exp.bullets.filter((b) => b.checked) : [];

  const escapedBullets = activeBullets
    .map((b) => `  \\item ${b.prefix ? `\\textbf{${b.prefix}} ` : ""}${b.text.replace(/&/g, "\\&")}`)
    .join("\n");

  const edu = profile.education.find((e) => e.checked);

  return `\\documentclass[10pt]{article}
\\usepackage[margin=0.5in]{geometry}
\\usepackage[hidelinks]{hyperref}

\\begin{document}

\\begin{center}
{\\Large \\textbf{${p.name}}}\\\\
${p.location} $\\bullet$ ${p.phone} $\\bullet$ ${p.email}
\\end{center}

\\section*{SUMMARY}
${profile.professional_summary.replace(/&/g, "\\&")}

\\section*{WORK EXPERIENCE}
${exp ? `\\textbf{${exp.company}} \\hfill ${exp.dates}\\\\
\\textit{${exp.role}}\\\\
\\begin{itemize}
${escapedBullets}
\\end{itemize}` : ""}

\\section*{EDUCATION}
${edu ? `\\textbf{${edu.school}} \\hfill ${edu.year}\\\\
${edu.degree} (${edu.gpa || ""})` : ""}

\\section*{SKILLS}
${profile.skills.join(" $\\bullet$ ")}

\\end{document}`;
}
