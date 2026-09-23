export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  github?: string;
  linkedin?: string;
}

export interface CandidateExperience {
  id: string;
  role: string;
  company: string;
  dates: string;
  description: string;
  bullets: string[];
  skills: string[];
  grounded: boolean;
}

export interface CandidateProject {
  id: string;
  name: string;
  technologies: string[];
  description: string;
  link?: string;
}

export interface CandidateEducation {
  id: string;
  degree: string;
  school: string;
  location: string;
  year: string;
}

export interface CandidateProfile {
  personal_info: PersonalInfo;
  professional_summary: string;
  experience: CandidateExperience[];
  projects: CandidateProject[];
  skills: string[];
  education: CandidateEducation[];
  certifications: string[];
}

export interface ApplicationRecord {
  id: string;
  company: string;
  role: string;
  status: "Draft" | "Applied" | "Interview" | "Offer" | "Rejected";
  resumeVersion: string;
  matchScore: number;
  date: string;
  jobDescription: string;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  previewClass: string;
}

export const INITIAL_PROFILE: CandidateProfile = {
  personal_info: {
    name: "Mitra",
    email: "mitra@example.com",
    phone: "+1 (555) 019-2834",
    location: "San Francisco, CA",
    github: "github.com/mitra",
    linkedin: "linkedin.com/in/mitra",
  },
  professional_summary:
    "Software engineer with focused experience in Python backend development, REST API design, and asynchronous microservices. Passionate about system performance, test automation, and reliable cloud deployments.",
  experience: [
    {
      id: "exp-1",
      role: "Backend Developer",
      company: "Acme Corp",
      dates: "2022 - Present",
      description: "Designed core backend services and scalable REST APIs for customer-facing applications.",
      bullets: [
        "Architected high-throughput FastAPI REST API endpoints reducing p95 latency by 35%.",
        "Engineered automated Pytest test suites achieving 92% coverage across critical business transactions.",
        "Containerized legacy Python services with Docker and standardized deployment pipelines."
      ],
      skills: ["Python", "FastAPI", "REST APIs", "PostgreSQL", "Docker", "Pytest"],
      grounded: true,
    },
    {
      id: "exp-2",
      role: "Software Engineer",
      company: "Cedar Systems",
      dates: "2021 - 2022",
      description: "Implemented web services and data pipelines for internal telemetry platforms.",
      bullets: [
        "Implemented RESTful endpoints with Flask and optimized PostgreSQL queries.",
        "Built data extraction scripts with SQL and resolved high-priority backend issues."
      ],
      skills: ["Python", "Flask", "REST APIs", "SQL", "Git", "React"],
      grounded: true,
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "Autonomous Resume Agent",
      technologies: ["Python", "LangGraph", "FastAPI", "LaTeX"],
      description: "Deterministic AI resume tailoring system preventing hallucinations via LangGraph pipeline.",
      link: "github.com/Mitrakulal/Resume_builder"
    }
  ],
  skills: [
    "Python",
    "FastAPI",
    "REST APIs",
    "React",
    "PostgreSQL",
    "Docker",
    "Pytest",
    "Flask",
    "SQL",
    "Git",
    "Linux"
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.S. in Computer Science",
      school: "University of California",
      location: "Berkeley, CA",
      year: "2021"
    }
  ],
  certifications: [
    "AWS Certified Cloud Practitioner",
    "Python Institute Certified Associate"
  ]
};

export const INITIAL_APPLICATIONS: ApplicationRecord[] = [
  {
    id: "app-1",
    company: "Acme Corp",
    role: "Backend Developer",
    status: "Interview",
    resumeVersion: "Version 3",
    matchScore: 82,
    date: "2026-09-21",
    jobDescription: "We are looking for a Python backend developer. Required skills include Python and REST APIs. Experience with FastAPI is preferred..."
  },
  {
    id: "app-2",
    company: "Stripe",
    role: "Infrastructure Engineer",
    status: "Applied",
    resumeVersion: "Version 2",
    matchScore: 78,
    date: "2026-09-18",
    jobDescription: "Seeking an infrastructure engineer proficient in Python, Docker, Linux, and high-availability database architectures..."
  },
  {
    id: "app-3",
    company: "Linear",
    role: "Fullstack Product Engineer",
    status: "Applied",
    resumeVersion: "Version 1",
    matchScore: 75,
    date: "2026-09-14",
    jobDescription: "Join Linear to build high-craft software. Requires Python or Node backend with React frontend fluency and clean API design..."
  },
  {
    id: "app-4",
    company: "Vercel",
    role: "API Platform Engineer",
    status: "Offer",
    resumeVersion: "Version 4",
    matchScore: 91,
    date: "2026-09-10",
    jobDescription: "Looking for an API platform specialist with deep mastery in Python, asynchronous services, and clean developer workflows..."
  }
];

export const TEMPLATES_GALLERY: ResumeTemplate[] = [
  {
    id: "article-standard",
    name: "Classic Article LaTeX",
    description: "Standard LaTeX article-class layout. Clean serif typography, horizontal section dividers, ATS-optimized.",
    category: "Academic & Tech",
    tags: ["ATS-Friendly", "Compact", "pdflatex"],
    previewClass: "template-classic"
  },
  {
    id: "linear-minimal",
    name: "Linear Modern",
    description: "Single-column clean sans-serif layout with subtle section metadata and high readability.",
    category: "Product & Engineering",
    tags: ["Minimalist", "Modern", "Single Page"],
    previewClass: "template-modern"
  },
  {
    id: "executive-slate",
    name: "Executive Clean",
    description: "Refined two-tier header with subtle bolding, generous line height, and structured experience blocks.",
    category: "Senior Roles",
    tags: ["Executive", "Spacious", "LaTeX"],
    previewClass: "template-exec"
  }
];

export interface PipelineStage {
  id: "read_jd" | "match" | "generate" | "compile";
  label: string;
  status: "idle" | "running" | "completed";
  durationMs: number;
  nodeDescription: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "read_jd",
    label: "Read JD",
    status: "completed",
    durationMs: 1200,
    nodeDescription: "Structured output extraction of must-haves, keywords, and job title."
  },
  {
    id: "match",
    label: "Match",
    status: "completed",
    durationMs: 700,
    nodeDescription: "Deterministic skill overlap set intersection and gap matrix calculation."
  },
  {
    id: "generate",
    label: "Generate",
    status: "completed",
    durationMs: 1800,
    nodeDescription: "Factually grounded rewrite of experience points without hallucinations."
  },
  {
    id: "compile",
    label: "Compile",
    status: "running",
    durationMs: 1100,
    nodeDescription: "Jinja2 LaTeX template rendering and pdflatex PDF generation."
  }
];

export function buildLatexDocument(profile: CandidateProfile, summary: string, bullets: string[]): string {
  const p = profile.personal_info;
  const escapedSummary = summary.replace(/&/g, "\\&").replace(/%/g, "\\%");
  const escapedBullets = bullets
    .map((b) => `  \\item ${b.replace(/&/g, "\\&").replace(/%/g, "\\%")}`)
    .join("\n");
  const escapedSkills = profile.skills.map((s) => `  \\item ${s.replace(/&/g, "\\&")}`).join("\n");
  const escapedEdu = profile.education
    .map((e) => `  \\item ${e.degree} -- ${e.school}, ${e.location} (${e.year})`)
    .join("\n");

  return `\\documentclass[11pt]{article}
\\usepackage[margin=0.5in]{geometry}
\\usepackage[hidelinks]{hyperref}

\\author{}
\\date{}

\\begin{document}

\\begin{center}
{\\Large \\textbf{${p.name}}}\\\\
${p.email} | ${p.phone} | ${p.github || ""}
\\end{center}

\\section*{SUMMARY}
${escapedSummary}

\\section*{EXPERIENCE}
\\begin{itemize}
${escapedBullets}
\\end{itemize}

\\section*{SKILLS}
\\begin{itemize}
${escapedSkills}
\\end{itemize}

\\section*{EDUCATION}
\\begin{itemize}
${escapedEdu}
\\end{itemize}

\\end{document}`;
}
