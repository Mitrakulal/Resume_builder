/* The 5-stage pipeline definition + demo timing.
   In production each stage would call the LangGraph backend;
   here the stages animate client-side and results come from demo data. */

export type StageId = "read" | "search" | "match" | "generate" | "proofread";

export interface PipelineStage {
  id: StageId;
  title: string;
  description: string;
  /** simulated duration in ms for the demo animation */
  durationMs: number;
  /** rotating status lines shown while the stage runs */
  activity: string[];
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "read",
    title: "Reading the job description",
    description: "Extracting requirements, must-have skills and keywords from the JD.",
    durationMs: 2600,
    activity: [
      "Parsing JD text…",
      "Extracting must-have skills…",
      "Pulling responsibilities & keywords…",
    ],
  },
  {
    id: "search",
    title: "Searching your portfolio",
    description: "Scanning your resume, projects and past work for relevant proof.",
    durationMs: 2800,
    activity: [
      "Loading portfolio entries…",
      "Scanning 2 roles & 3 projects…",
      "Indexing 16 skills…",
    ],
  },
  {
    id: "match",
    title: "Matching skills to the job",
    description: "Ranking every skill and entry by relevance to the requirements.",
    durationMs: 3000,
    activity: [
      "Scoring skill relevance…",
      "Ranking portfolio entries…",
      "Computing overall match score…",
    ],
  },
  {
    id: "generate",
    title: "Generating your cover letter",
    description: "Drafting a tailored letter grounded only in your real experience.",
    durationMs: 3400,
    activity: [
      "Selecting strongest proof points…",
      "Drafting opening paragraph…",
      "Weaving in JD keywords…",
    ],
  },
  {
    id: "proofread",
    title: "Proofreading grammar & tone",
    description: "Checking grammar, clarity and tone consistency with inline fixes.",
    durationMs: 2600,
    activity: [
      "Checking grammar…",
      "Tightening filler phrases…",
      "Aligning tone…",
    ],
  },
];

export const TOTAL_PIPELINE_MS = PIPELINE_STAGES.reduce((sum, s) => sum + s.durationMs, 0);
