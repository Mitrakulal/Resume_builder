/* ------------------------------------------------------------------ */
/*  DEMO DATA — everything in this file is fictional sample content.    */
/*  The UI labels it as demo data; no real backend is called.           */
/* ------------------------------------------------------------------ */

export type Tone = "Professional" | "Friendly" | "Bold";
export const TONES: Tone[] = ["Professional", "Friendly", "Bold"];

export type ApplicationStatus = "draft" | "pipeline" | "matched" | "letter" | "ready";
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: "Draft",
  pipeline: "Pipeline running",
  matched: "Matched",
  letter: "Letter drafted",
  ready: "Ready to send",
};

/* ------------------------------ Profile ----------------------------- */

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  links: string[];
}

export interface ExperienceItem {
  id: string;
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: string;
  skillsUsed: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  skillsUsed: string[];
  date: string;
  link?: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface CandidateProfile {
  contact: ContactInfo;
  summary: string;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: string[];
  education: EducationItem[];
}

export const demoProfile: CandidateProfile = {
  contact: {
    name: "Aarav Mehta",
    email: "aarav.mehta@example.com",
    phone: "+91 98765 43210",
    location: "Bengaluru, India",
    links: ["github.com/aaravmehta", "linkedin.com/in/aaravmehta", "aaravmehta.dev"],
  },
  summary:
    "Frontend-leaning full-stack developer with 2 years of experience building React applications and production RAG systems. Comfortable owning features end to end — from Figma handoff to deploy.",
  experience: [
    {
      id: "exp-001",
      title: "Frontend Engineering Intern",
      organization: "Lumen Labs",
      startDate: "Jan 2025",
      endDate: "Present",
      description:
        "Rebuilt the marketing site and internal dashboard in React, TypeScript and Tailwind CSS, cutting page load times by 34%. Shipped a RAG-powered support chat widget now handling 2,000+ conversations a month.",
      skillsUsed: ["React", "TypeScript", "Tailwind CSS", "RAG", "REST APIs"],
    },
    {
      id: "exp-002",
      title: "Freelance Web Developer",
      organization: "Self-employed",
      startDate: "Jun 2024",
      endDate: "Dec 2024",
      description:
        "Delivered 6 client websites with React and Node.js backends. Set up PostgreSQL schemas, Docker-based deploys, and CI pipelines on GitHub Actions.",
      skillsUsed: ["React", "Node.js", "PostgreSQL", "Docker", "REST APIs"],
    },
  ],
  projects: [
    {
      id: "proj-001",
      name: "Mattr Chat",
      description:
        "Production RAG chatbot for a real client: document ingestion pipeline, hybrid retrieval with reranking, and a React chat UI. Serves 2,000+ conversations monthly with 92% answer relevance.",
      skillsUsed: ["Python", "LangChain", "RAG", "React", "LLMs"],
      date: "2025",
      link: "github.com/aaravmehta/mattr-chat",
    },
    {
      id: "proj-002",
      name: "AttendX",
      description:
        "QR-based attendance system for college events: React frontend, Node.js API, PostgreSQL, and real-time dashboards. Used across 12 events with 4,000+ check-ins.",
      skillsUsed: ["React", "Node.js", "PostgreSQL", "REST APIs"],
      date: "2024",
      link: "github.com/aaravmehta/attendx",
    },
    {
      id: "proj-003",
      name: "Portfolio v3",
      description:
        "Personal portfolio rebuilt with React, TypeScript and Tailwind CSS. Scores 100 on Lighthouse performance and accessibility.",
      skillsUsed: ["React", "TypeScript", "Tailwind CSS", "Vite"],
      date: "2025",
      link: "aaravmehta.dev",
    },
  ],
  skills: [
    "React",
    "TypeScript",
    "Tailwind CSS",
    "JavaScript",
    "Python",
    "Node.js",
    "PostgreSQL",
    "RAG",
    "LangChain",
    "LLMs",
    "Prompt Engineering",
    "REST APIs",
    "Docker",
    "Git",
    "Figma",
    "Vite",
  ],
  education: [
    {
      id: "edu-001",
      institution: "Visvesvaraya Technological University",
      degree: "B.E. Computer Science",
      startDate: "2024",
      endDate: "2028",
    },
  ],
};

/* ------------------------------- JDs -------------------------------- */

export interface JDRequirements {
  jobTitle: string;
  company: string;
  location: string;
  mustHave: string[];
  niceToHave: string[];
  responsibilities: string[];
  keywords: string[];
}

export interface SampleJD {
  id: string;
  title: string;
  company: string;
  location: string;
  sourceLabel: string;
  postedDate: string;
  text: string;
  requirements: JDRequirements;
}

export const sampleJDs: SampleJD[] = [
  {
    id: "jd-frontend",
    title: "Frontend Engineer",
    company: "Northwind Labs",
    location: "Bengaluru · Hybrid",
    sourceLabel: "Pasted from job board",
    postedDate: "Sep 18, 2026",
    text: "Northwind Labs is hiring a Frontend Engineer to join our product team in Bengaluru (hybrid). You will own user-facing features end to end — from Figma handoff to production deploy — across our marketing site and SaaS dashboard.\n\nMust-haves: 2+ years with React and TypeScript, strong Tailwind CSS skills, experience integrating REST APIs, and a sharp eye for detail. Nice to have: Vite, Figma fluency, and accessibility (WCAG) knowledge.\n\nYou will: build reusable component libraries, improve Core Web Vitals, collaborate with designers and backend engineers, and ship weekly.",
    requirements: {
      jobTitle: "Frontend Engineer",
      company: "Northwind Labs",
      location: "Bengaluru · Hybrid",
      mustHave: ["React", "TypeScript", "Tailwind CSS", "REST APIs"],
      niceToHave: ["Vite", "Figma", "Accessibility (WCAG)"],
      responsibilities: [
        "Own user-facing features end to end, Figma to production",
        "Build and maintain a reusable component library",
        "Improve Core Web Vitals across marketing site and dashboard",
        "Ship weekly in collaboration with designers and backend engineers",
      ],
      keywords: ["React", "TypeScript", "Tailwind CSS", "REST APIs", "component library", "Core Web Vitals"],
    },
  },
  {
    id: "jd-ai-intern",
    title: "GenAI Intern",
    company: "Abstrabit",
    location: "Bengaluru · On-site",
    sourceLabel: "Imported from PDF",
    postedDate: "Sep 21, 2026",
    text: "Abstrabit is looking for a GenAI Intern (6 months, paid) to work on production LLM features. You will help build retrieval pipelines, evaluate prompts, and ship AI features used by real customers.\n\nMust-haves: strong Python, hands-on experience with LLMs and RAG systems, familiarity with LangChain or similar frameworks. Nice to have: prompt engineering practice, React for internal tooling, vector databases.\n\nYou will: build and evaluate RAG pipelines, run prompt experiments, instrument answer quality metrics, and demo progress weekly.",
    requirements: {
      jobTitle: "GenAI Intern",
      company: "Abstrabit",
      location: "Bengaluru · On-site",
      mustHave: ["Python", "LLMs", "RAG", "LangChain"],
      niceToHave: ["Prompt Engineering", "React", "Vector databases"],
      responsibilities: [
        "Build and evaluate RAG pipelines over client documents",
        "Run prompt experiments and track answer-quality metrics",
        "Ship AI features used by real customers",
        "Demo progress to the team every week",
      ],
      keywords: ["Python", "LLMs", "RAG", "LangChain", "prompt engineering", "retrieval"],
    },
  },
  {
    id: "jd-fullstack",
    title: "Full-Stack Developer",
    company: "Kite & Co",
    location: "Remote · India",
    sourceLabel: "Pasted from link",
    postedDate: "Sep 22, 2026",
    text: "Kite & Co (early-stage startup) is hiring a Full-Stack Developer to build our logistics dashboard. Small team, big ownership: you will work across React frontend and Node.js/PostgreSQL backend.\n\nMust-haves: React, TypeScript, Node.js, PostgreSQL, REST API design. Nice to have: Docker, CI/CD, prior startup experience.\n\nYou will: design schemas, build APIs, implement dashboard features in React, and own deploys.",
    requirements: {
      jobTitle: "Full-Stack Developer",
      company: "Kite & Co",
      location: "Remote · India",
      mustHave: ["React", "TypeScript", "Node.js", "PostgreSQL", "REST APIs"],
      niceToHave: ["Docker", "CI/CD", "Startup experience"],
      responsibilities: [
        "Design PostgreSQL schemas and build REST APIs in Node.js",
        "Implement dashboard features in React + TypeScript",
        "Own deploys and CI pipelines",
        "Work directly with founders on product direction",
      ],
      keywords: ["React", "TypeScript", "Node.js", "PostgreSQL", "REST APIs", "Docker"],
    },
  },
];

export function getJD(id: string): SampleJD {
  return sampleJDs.find((jd) => jd.id === id) ?? sampleJDs[0];
}

/* --------------------------- Match results --------------------------- */

export interface SkillMatch {
  skill: string;
  score: number; // 0–100
  matchedRequirement: string;
  source: "Experience" | "Project" | "Skills";
}

export interface EntryMatch {
  entryId: string;
  entryType: "experience" | "project";
  title: string;
  subtitle: string;
  relevance: number; // 0–100
  matchedRequirement: string;
  highlight: string;
}

export interface MatchData {
  score: number;
  skillMatches: SkillMatch[];
  entryMatches: EntryMatch[];
}

export const matchData: Record<string, MatchData> = {
  "jd-frontend": {
    score: 92,
    skillMatches: [
      { skill: "React", score: 98, matchedRequirement: "2+ years with React", source: "Experience" },
      { skill: "TypeScript", score: 95, matchedRequirement: "TypeScript proficiency", source: "Experience" },
      { skill: "Tailwind CSS", score: 93, matchedRequirement: "Strong Tailwind CSS skills", source: "Experience" },
      { skill: "REST APIs", score: 82, matchedRequirement: "Experience integrating REST APIs", source: "Project" },
      { skill: "Figma", score: 74, matchedRequirement: "Figma fluency (nice to have)", source: "Skills" },
      { skill: "Vite", score: 70, matchedRequirement: "Vite (nice to have)", source: "Project" },
    ],
    entryMatches: [
      {
        entryId: "exp-001",
        entryType: "experience",
        title: "Frontend Engineering Intern",
        subtitle: "Lumen Labs · Jan 2025 – Present",
        relevance: 96,
        matchedRequirement: "React + TypeScript + Tailwind CSS",
        highlight: "Rebuilt marketing site and dashboard; cut load times 34%",
      },
      {
        entryId: "proj-001",
        entryType: "project",
        title: "Mattr Chat",
        subtitle: "Production RAG chatbot · 2025",
        relevance: 88,
        matchedRequirement: "Shipping user-facing features",
        highlight: "React chat UI serving 2,000+ conversations/month",
      },
      {
        entryId: "proj-003",
        entryType: "project",
        title: "Portfolio v3",
        subtitle: "Personal site · 2025",
        relevance: 81,
        matchedRequirement: "Eye for detail, craft",
        highlight: "100 Lighthouse on performance and accessibility",
      },
    ],
  },
  "jd-ai-intern": {
    score: 89,
    skillMatches: [
      { skill: "RAG", score: 94, matchedRequirement: "Hands-on RAG systems", source: "Project" },
      { skill: "Python", score: 92, matchedRequirement: "Strong Python", source: "Project" },
      { skill: "LangChain", score: 90, matchedRequirement: "LangChain familiarity", source: "Project" },
      { skill: "LLMs", score: 88, matchedRequirement: "Hands-on experience with LLMs", source: "Project" },
      { skill: "Prompt Engineering", score: 80, matchedRequirement: "Prompt engineering (nice to have)", source: "Skills" },
      { skill: "React", score: 68, matchedRequirement: "React for internal tooling (nice to have)", source: "Experience" },
    ],
    entryMatches: [
      {
        entryId: "proj-001",
        entryType: "project",
        title: "Mattr Chat",
        subtitle: "Production RAG chatbot · 2025",
        relevance: 97,
        matchedRequirement: "RAG pipelines + answer quality",
        highlight: "Hybrid retrieval with reranking; 92% answer relevance",
      },
      {
        entryId: "exp-001",
        entryType: "experience",
        title: "Frontend Engineering Intern",
        subtitle: "Lumen Labs · Jan 2025 – Present",
        relevance: 84,
        matchedRequirement: "Shipping AI features to real users",
        highlight: "Support chat widget in production",
      },
      {
        entryId: "proj-002",
        entryType: "project",
        title: "AttendX",
        subtitle: "Attendance system · 2024",
        relevance: 72,
        matchedRequirement: "End-to-end ownership",
        highlight: "4,000+ check-ins across 12 events",
      },
    ],
  },
  "jd-fullstack": {
    score: 78,
    skillMatches: [
      { skill: "React", score: 90, matchedRequirement: "React", source: "Experience" },
      { skill: "TypeScript", score: 88, matchedRequirement: "TypeScript", source: "Experience" },
      { skill: "REST APIs", score: 84, matchedRequirement: "REST API design", source: "Experience" },
      { skill: "Node.js", score: 76, matchedRequirement: "Node.js", source: "Experience" },
      { skill: "PostgreSQL", score: 72, matchedRequirement: "PostgreSQL", source: "Project" },
      { skill: "Docker", score: 64, matchedRequirement: "Docker (nice to have)", source: "Skills" },
    ],
    entryMatches: [
      {
        entryId: "exp-002",
        entryType: "experience",
        title: "Freelance Web Developer",
        subtitle: "Self-employed · Jun 2024 – Dec 2024",
        relevance: 86,
        matchedRequirement: "Full-stack ownership",
        highlight: "6 client sites: React + Node.js + PostgreSQL",
      },
      {
        entryId: "proj-002",
        entryType: "project",
        title: "AttendX",
        subtitle: "Attendance system · 2024",
        relevance: 80,
        matchedRequirement: "Schema design + APIs",
        highlight: "Node.js API with real-time dashboards",
      },
      {
        entryId: "exp-001",
        entryType: "experience",
        title: "Frontend Engineering Intern",
        subtitle: "Lumen Labs · Jan 2025 – Present",
        relevance: 78,
        matchedRequirement: "React + TypeScript depth",
        highlight: "Component-driven dashboard rebuild",
      },
    ],
  },
};

/* --------------------------- Cover letters --------------------------- */

export interface ProofreadCorrection {
  original: string;
  corrected: string;
  kind: "grammar" | "tone" | "clarity";
  note: string;
}

export interface LetterVariant {
  subject: string;
  greeting: string;
  paragraphs: string[];
  signoff: string;
  corrections: ProofreadCorrection[];
}

export const letterBodies: Record<string, Record<Tone, LetterVariant>> = {
  "jd-frontend": {
    Professional: {
      subject: "Application for Frontend Engineer — Aarav Mehta",
      greeting: "Dear Hiring Manager,",
      paragraphs: [
        "I am writing to apply for the Frontend Engineer role at Northwind Labs. With two years of experience building responsive React applications, I was excited to see an opening that values clean interfaces and thoughtful user experience.",
        "At Lumen Labs, I rebuilt the company's marketing site and internal dashboard using React, TypeScript, and Tailwind CSS, improving page load times by 34%. I also shipped a RAG-powered support chat widget that now handles over 2,000 conversations a month.",
        "My recent work maps directly onto your stack: component-driven development in React, type-safe code with TypeScript, and utility-first styling with Tailwind CSS. I am comfortable owning features end to end, from Figma handoff to production deploy.",
        "I would welcome the chance to discuss how I can contribute to Northwind Labs. Thank you for your time and consideration.",
      ],
      signoff: "Best regards,\nAarav Mehta",
      corrections: [
        { original: "I am writing to apply", corrected: "I am applying", kind: "clarity", note: "Stronger opening — cut the filler." },
        { original: "I was excited", corrected: "I am excited", kind: "grammar", note: "Keep the tense in the present." },
        { original: "over 2,000 conversations a month", corrected: "2,000+ conversations a month", kind: "tone", note: "More concise, confident phrasing." },
        { original: "Thank you for your time and consideration.", corrected: "Thank you for your consideration.", kind: "clarity", note: "Trim the redundant courtesy." },
      ],
    },
    Friendly: {
      subject: "Frontend Engineer application — Aarav Mehta",
      greeting: "Hello Northwind Labs team,",
      paragraphs: [
        "When I came across the Frontend Engineer opening, it felt like a role written for me. I love turning complex workflows into interfaces that feel effortless, and your team's focus on craft really stood out.",
        "At Lumen Labs, I rebuilt the company's marketing site and internal dashboard using React, TypeScript, and Tailwind CSS, improving page load times by 34%. I also shipped a support chat widget that now handles over 2,000 conversations a month — and I genuinely enjoyed every part of building it.",
        "Your stack is exactly where I do my best work: React components, type-safe TypeScript, and Tailwind CSS. I'm comfortable owning features end to end, from Figma handoff to production deploy, and I collaborate closely with designers.",
        "I'd love to chat about what you're building and where I could help. Thanks so much for considering my application — hope to speak soon!",
      ],
      signoff: "Warmly,\nAarav Mehta",
      corrections: [
        { original: "it felt like a role written for me", corrected: "it felt like a perfect fit", kind: "tone", note: "Slightly more professional while staying warm." },
        { original: "I genuinely enjoyed every part of building it", corrected: "I enjoyed building every part of it", kind: "clarity", note: "Tighter sentence rhythm." },
        { original: "hope to speak soon!", corrected: "I hope we speak soon.", kind: "tone", note: "Complete the sentence for a polished close." },
      ],
    },
    Bold: {
      subject: "Frontend Engineer who ships — Aarav Mehta",
      greeting: "Hi,",
      paragraphs: [
        "Northwind Labs needs a Frontend Engineer who ships. I build fast, accessible React interfaces — and I have the production track record to prove it.",
        "At Lumen Labs I rebuilt the marketing site and dashboard in React, TypeScript, and Tailwind CSS and cut load times by 34%. Then I shipped a RAG-powered support chat widget now handling over 2,000 conversations a month.",
        "React, TypeScript, Tailwind, REST APIs — that's my daily toolkit. I own features end to end, from Figma handoff to production deploy, and I measure my work in shipped impact, not story points.",
        "Let's talk. I'm ready to contribute from week one.",
      ],
      signoff: "— Aarav Mehta",
      corrections: [
        { original: "who ships", corrected: "who ships fast", kind: "tone", note: "Reinforce the bold positioning." },
        { original: "over 2,000 conversations a month", corrected: "2,000+ conversations a month", kind: "clarity", note: "Punchier metric formatting." },
        { original: "Let's talk.", corrected: "Let's talk this week.", kind: "tone", note: "A specific call to action converts better." },
      ],
    },
  },
  "jd-ai-intern": {
    Professional: {
      subject: "Application for GenAI Intern — Aarav Mehta",
      greeting: "Dear Hiring Manager,",
      paragraphs: [
        "I am writing to apply for the GenAI Intern role at Abstrabit. As the builder of a production RAG chatbot serving real customers, I was excited to find an internship centered on retrieval pipelines and answer quality.",
        "For my project Mattr Chat, I designed a document ingestion pipeline with hybrid retrieval and reranking in Python and LangChain, reaching 92% answer relevance across 2,000+ monthly conversations. I instrumented quality metrics and iterated on prompts weekly — the same loop your posting describes.",
        "I bring strong Python, hands-on LLM experience, and a habit of measuring what I ship. I would be glad to bring that rigor to Abstrabit's AI features.",
        "Thank you for your time and consideration. I would welcome the opportunity to discuss the role further.",
      ],
      signoff: "Best regards,\nAarav Mehta",
      corrections: [
        { original: "I am writing to apply", corrected: "I am applying", kind: "clarity", note: "Stronger opening — cut the filler." },
        { original: "I was excited", corrected: "I am excited", kind: "grammar", note: "Keep the tense in the present." },
        { original: "I would be glad to bring that rigor", corrected: "I will bring that rigor", kind: "tone", note: "Active voice reads more confident." },
      ],
    },
    Friendly: {
      subject: "GenAI Intern application — Aarav Mehta",
      greeting: "Hello Abstrabit team,",
      paragraphs: [
        "I got genuinely excited reading your GenAI Intern posting — building RAG pipelines and obsessing over answer quality is exactly how I spent the last year.",
        "My project Mattr Chat is a production RAG chatbot: Python and LangChain ingestion pipeline, hybrid retrieval with reranking, and quality metrics I tracked every week. It now serves 2,000+ conversations a month at 92% answer relevance, and tuning it taught me more than any course could.",
        "I'd love to bring that hands-on experience to your team — running prompt experiments, instrumenting quality, and demoing progress every week sounds like my ideal internship.",
        "Thanks so much for considering my application. I'd really enjoy chatting about what you're building!",
      ],
      signoff: "Warmly,\nAarav Mehta",
      corrections: [
        { original: "I got genuinely excited reading", corrected: "I was excited reading", kind: "tone", note: "Slightly calmer enthusiasm for a first impression." },
        { original: "taught me more than any course could", corrected: "taught me a great deal", kind: "tone", note: "Avoid overstatement; stay credible." },
      ],
    },
    Bold: {
      subject: "GenAI Intern with a production RAG system — Aarav Mehta",
      greeting: "Hi,",
      paragraphs: [
        "Most GenAI interns have tutorials. I have a production RAG system serving 2,000+ real conversations a month at 92% answer relevance.",
        "Mattr Chat: Python + LangChain ingestion pipeline, hybrid retrieval with reranking, weekly prompt experiments, and quality metrics I actually tracked. I know what breaks in RAG systems because I've fixed it in production.",
        "Give me your hardest retrieval problem in week one. I'll demo progress every Friday.",
        "Let's talk.",
      ],
      signoff: "— Aarav Mehta",
      corrections: [
        { original: "Most GenAI interns have tutorials.", corrected: "Many applicants have tutorials.", kind: "tone", note: "Confident without disparaging peers." },
        { original: "quality metrics I actually tracked", corrected: "quality metrics I tracked", kind: "clarity", note: "\"Actually\" adds no meaning — cut it." },
      ],
    },
  },
  "jd-fullstack": {
    Professional: {
      subject: "Application for Full-Stack Developer — Aarav Mehta",
      greeting: "Dear Hiring Manager,",
      paragraphs: [
        "I am writing to apply for the Full-Stack Developer role at Kite & Co. Your posting asks for big ownership across React and Node.js — that is exactly how I have worked as a freelancer and as an intern.",
        "As a freelance developer I delivered 6 client websites with React frontends and Node.js APIs backed by PostgreSQL, including schema design, Docker-based deploys, and CI pipelines. At Lumen Labs I rebuilt an internal dashboard in React and TypeScript, cutting load times by 34%.",
        "I am comfortable designing schemas, building REST APIs, implementing dashboard features, and owning deploys — the full loop your team needs.",
        "Thank you for your time and consideration. I would welcome the chance to discuss how I can help Kite & Co move faster.",
      ],
      signoff: "Best regards,\nAarav Mehta",
      corrections: [
        { original: "I am writing to apply", corrected: "I am applying", kind: "clarity", note: "Stronger opening — cut the filler." },
        { original: "that is exactly how I have worked", corrected: "that is how I work", kind: "grammar", note: "Simpler tense, cleaner read." },
        { original: "help Kite & Co move faster", corrected: "help Kite & Co ship faster", kind: "tone", note: "\"Ship\" matches startup vocabulary." },
      ],
    },
    Friendly: {
      subject: "Full-Stack Developer application — Aarav Mehta",
      greeting: "Hello Kite & Co team,",
      paragraphs: [
        "Small team, big ownership, React to PostgreSQL — your Full-Stack Developer posting reads like a summary of my last two years. I'd love to be part of it.",
        "Freelancing taught me the full loop: talking to clients, designing PostgreSQL schemas, building Node.js APIs, shipping React dashboards, and owning Docker deploys and CI. At Lumen Labs I did the same at larger scale, rebuilding a dashboard that loads 34% faster.",
        "I'm at my best when I can take a feature from idea to production and see it used. That's the energy I'd bring to your logistics dashboard.",
        "Thanks for considering my application — I'd really enjoy talking through what you're building!",
      ],
      signoff: "Warmly,\nAarav Mehta",
      corrections: [
        { original: "reads like a summary of my last two years", corrected: "matches my last two years closely", kind: "tone", note: "More natural phrasing." },
        { original: "That's the energy I'd bring", corrected: "That's what I'd bring", kind: "clarity", note: "Slightly more professional." },
      ],
    },
    Bold: {
      subject: "Full-stack dev, zero hand-holding needed — Aarav Mehta",
      greeting: "Hi,",
      paragraphs: [
        "You need someone who can own the stack. I've done it: 6 freelance client sites plus a production dashboard — React, TypeScript, Node.js, PostgreSQL, Docker deploys, CI. Idea to production, solo.",
        "At Lumen Labs I rebuilt the internal dashboard and cut load times 34%. Freelancing, I learned to talk to clients, scope work, and ship without a PM watching over me.",
        "Founders shouldn't have to manage their full-stack hire. I manage myself and ship weekly.",
        "Let's talk.",
      ],
      signoff: "— Aarav Mehta",
      corrections: [
        { original: "zero hand-holding needed", corrected: "no hand-holding needed", kind: "tone", note: "Slightly softer while keeping edge." },
        { original: "without a PM watching over me", corrected: "independently", kind: "tone", note: "One word does the job." },
      ],
    },
  },
};

/* ---------------------------- Applications --------------------------- */

export interface Application {
  id: string;
  role: string;
  company: string;
  status: ApplicationStatus;
  matchScore: number;
  createdAt: string; // ISO date
  jdId: string;
  tone: Tone;
}

export const demoApplications: Application[] = [
  { id: "app-1", role: "Frontend Engineer", company: "Northwind Labs", status: "ready", matchScore: 92, createdAt: "2026-09-20", jdId: "jd-frontend", tone: "Professional" },
  { id: "app-2", role: "GenAI Intern", company: "Abstrabit", status: "letter", matchScore: 89, createdAt: "2026-09-23", jdId: "jd-ai-intern", tone: "Friendly" },
  { id: "app-3", role: "Full-Stack Developer", company: "Kite & Co", status: "matched", matchScore: 78, createdAt: "2026-09-24", jdId: "jd-fullstack", tone: "Professional" },
];

/* ------------------------- Marketing content ------------------------- */

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  initials: string;
}

export const testimonials: Testimonial[] = [
  {
    name: "Priya Nair",
    role: "Frontend Developer, Bengaluru",
    quote: "I pasted a JD during my lunch break and had a tailored, proofread cover letter before my coffee went cold. The skill-match breakdown showed me exactly why I was a fit.",
    initials: "PN",
  },
  {
    name: "Rahul Verma",
    role: "CS Undergrad, Class of 2027",
    quote: "The best part is it never invents experience. Every line of my letter traced back to my actual projects — I walked into interviews confident about every claim.",
    initials: "RV",
  },
  {
    name: "Sofia D'Souza",
    role: "Career switcher → Product",
    quote: "The tone selector is genius. Professional for the banks, bold for the startups. My response rate tripled in three weeks.",
    initials: "SD",
  },
];

export interface Faq {
  q: string;
  a: string;
}

export const faqs: Faq[] = [
  {
    q: "Does it invent experience to make me look better?",
    a: "Never. Every sentence in your cover letter is traceable to entries in your portfolio — projects, roles, and skills you actually have. The AI selects, ranks, and rewords; it does not fabricate employers, titles, dates, or metrics.",
  },
  {
    q: "How do I give it a job description?",
    a: "Paste the text, drop in a link, or upload the PDF. The reader stage extracts requirements, must-have skills, and keywords automatically — you can review and edit them before the pipeline continues.",
  },
  {
    q: "What does the proofreading stage actually check?",
    a: "Grammar, spelling, and tone consistency. It flags filler phrases, tense slips, and weak closings, showing each fix as an inline suggestion you can accept or ignore.",
  },
  {
    q: "Is my data sent to the cloud?",
    a: "In the full product, JD reading and skill matching run on a local model so your personal data stays on your machine; only the final writing step uses a cloud model for quality. This demo runs entirely in your browser with sample data.",
  },
  {
    q: "Can I edit the generated letter?",
    a: "Yes — the letter editor is fully editable, with tone presets (Professional, Friendly, Bold), one-click regenerate, and a downloadable final copy.",
  },
];

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    features: ["3 tailored applications / month", "JD paste + PDF upload", "Proofreading pass", "Demo portfolio"],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/month",
    features: ["Unlimited applications", "Link import + bulk JD queue", "All 3 tone presets", "Application tracker", "Priority generation"],
    cta: "Go Pro",
    highlighted: true,
  },
  {
    name: "Team",
    price: "Custom",
    period: "",
    features: ["Everything in Pro", "Shared portfolio library", "Admin analytics", "SSO & support"],
    cta: "Talk to us",
    highlighted: false,
  },
];

export const demoNotice =
  "Demo mode — all data on this page is fictional and everything runs locally in your browser. No backend calls are made.";
