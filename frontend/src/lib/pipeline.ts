/* The real six-node LangGraph pipeline. Node ids match the backend. */

export type NodeId =
  | "read_jd"
  | "load_profile"
  | "match"
  | "generate_content"
  | "render"
  | "compile";

export interface PipelineStage {
  id: NodeId;
  title: string;
  description: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "read_jd",
    title: "Reading the job description",
    description: "Extracts the job title, must-have and nice-to-have skills, responsibilities and keywords.",
  },
  {
    id: "load_profile",
    title: "Loading your master profile",
    description: "Reads master_profile.json so the rest of the pipeline works from your real experience.",
  },
  {
    id: "match",
    title: "Matching skills to the job",
    description: "Compares your skills against the JD and records matched skills and gap areas.",
  },
  {
    id: "generate_content",
    title: "Writing tailored resume content",
    description: "Generates the summary, experience bullets, projects and skills section for this role.",
  },
  {
    id: "render",
    title: "Rendering the LaTeX resume",
    description: "Fills the resume template with the generated content and escapes it for LaTeX.",
  },
  {
    id: "compile",
    title: "Compiling the PDF",
    description: "Runs pdflatex and makes the tailored resume PDF available for download.",
  },
];

export const PIPELINE_NODE_IDS: NodeId[] = PIPELINE_STAGES.map((stage) => stage.id);

export function isNodeId(value: string): value is NodeId {
  return (PIPELINE_NODE_IDS as string[]).includes(value);
}

export interface PipelineDetails {
  job_title?: string;
  required_skills_count?: number;
  matched_skills?: number;
  missing_skills?: number;
  company?: string;
}

export type PipelineEvent =
  | { type: "start" }
  | {
      type: "node";
      node: NodeId;
      details: PipelineDetails;
      pdfUrl?: string;
      completedNodes: NodeId[];
    }
  | { type: "completed"; pdfUrl?: string }
  | { type: "error"; message: string };
