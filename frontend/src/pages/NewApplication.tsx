import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, PageHeader } from "../components/ui.tsx";
import { PipelineRunner } from "../components/PipelineRunner.tsx";
import { api, errorMessage } from "../lib/api.ts";
import { PIPELINE_NODE_IDS, type PipelineEvent } from "../lib/pipeline.ts";
import { useApp } from "../store/AppContext.tsx";

const inputCls =
  "w-full rounded-2xl border border-ink/15 bg-cream/50 px-4 py-2.5 text-[15px] outline-none transition-colors placeholder:text-inksoft/60 focus:border-accent";

export default function NewApplication() {
  const navigate = useNavigate();
  const { createApplication, updateApplication } = useApp();

  const [step, setStep] = useState<"input" | "running">("input");
  const [jdText, setJdText] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [resolvedTitle, setResolvedTitle] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    if (!jdText.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.startTailor(jdText.trim());
      createApplication({
        jobId: response.job_id,
        jdText: jdText.trim(),
        role,
        company,
      });
      setJobId(response.job_id);
      setStep("running");
    } catch (startError) {
      setError(errorMessage(startError));
    } finally {
      setLoading(false);
    }
  }

  const handlePipelineEvent = useCallback(
    (event: PipelineEvent) => {
      if (!jobId || event.type !== "node") return;

      const details = event.details;
      const extractedTitle =
        typeof details.job_title === "string" ? details.job_title.trim() : "";
      const jobTitle =
        extractedTitle && extractedTitle.toLowerCase() !== "unknown" ? extractedTitle : "";

      if (jobTitle) {
        setResolvedTitle(jobTitle);
      }

      updateApplication(jobId, {
        completedNodes: event.completedNodes,
        status: event.node === "compile" ? "matched" : "pipeline",
        ...(jobTitle ? { role: jobTitle } : {}),
        ...(event.pdfUrl ? { pdfUrl: event.pdfUrl } : {}),
        summary: {
          ...(jobTitle ? { jobTitle } : {}),
          ...(typeof details.required_skills_count === "number"
            ? { requiredSkillsCount: details.required_skills_count }
            : {}),
          ...(typeof details.matched_skills === "number"
            ? { matchedSkillsCount: details.matched_skills }
            : {}),
          ...(typeof details.missing_skills === "number"
            ? { missingSkillsCount: details.missing_skills }
            : {}),
        },
      });
    },
    [jobId, updateApplication],
  );

  const handlePipelineComplete = useCallback(
    (pdfUrl?: string) => {
      if (!jobId) return;
      updateApplication(jobId, {
        status: "matched",
        completedNodes: [...PIPELINE_NODE_IDS],
        pdfUrl: pdfUrl ?? api.pdfUrl(jobId),
        error: undefined,
      });
      navigate(`/app/match/${jobId}`);
    },
    [jobId, navigate, updateApplication],
  );

  const handlePipelineError = useCallback(
    (message: string) => {
      if (!jobId) return;
      updateApplication(jobId, { status: "failed", error: message });
    },
    [jobId, updateApplication],
  );

  return (
    <>
      <PageHeader
        title="New application"
        sub="Paste a job description and run the real six-node resume pipeline."
      />

      {step === "input" ? (
        <Card className="p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="target-role" className="mb-2 block text-sm font-semibold">
                Role <span className="font-normal text-inksoft">(optional)</span>
              </label>
              <input
                id="target-role"
                type="text"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className={inputCls}
                placeholder="e.g. AI/ML Engineer"
              />
            </div>
            <div>
              <label htmlFor="target-company" className="mb-2 block text-sm font-semibold">
                Company <span className="font-normal text-inksoft">(optional)</span>
              </label>
              <input
                id="target-company"
                type="text"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                className={inputCls}
                placeholder="e.g. Acme Labs"
              />
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="jd-text" className="mb-2 block text-sm font-semibold">
              Job description
            </label>
            <textarea
              id="jd-text"
              rows={14}
              value={jdText}
              onChange={(event) => setJdText(event.target.value)}
              className={`${inputCls} resize-y leading-relaxed`}
              placeholder="Paste the job description here…"
            />
            <p className="mt-2 text-xs text-inksoft">
              The job title comes from the JD. Role and company are used as a fallback label if
              the backend cannot extract them.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              <p className="font-semibold">Could not start the pipeline</p>
              <p className="mt-1 break-words">{error}</p>
            </div>
          )}

          <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-ink/8 pt-6 sm:flex-row sm:items-center">
            <p className="max-w-lg text-[13px] text-inksoft">
              The pipeline reads the JD, loads <code>master_profile.json</code>, matches skills,
              generates content, renders LaTeX and compiles the PDF.
            </p>
            <Button size="lg" onClick={handleRun} disabled={!jdText.trim() || loading}>
              {loading ? "Starting…" : "Run pipeline"} <span aria-hidden>→</span>
            </Button>
          </div>
        </Card>
      ) : (
        <PipelineRunner
          jobId={jobId ?? ""}
          jobTitle={resolvedTitle || role.trim() || "Tailored application"}
          onEvent={handlePipelineEvent}
          onComplete={handlePipelineComplete}
          onError={handlePipelineError}
        />
      )}
    </>
  );
}
