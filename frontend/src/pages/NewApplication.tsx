import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, PageHeader } from "../components/ui.tsx";
import { PipelineRunner } from "../components/PipelineRunner.tsx";
import { useApp } from "../store/AppContext.tsx";

export default function NewApplication() {
  const navigate = useNavigate();
  const { createApplication, updateApplication } = useApp();

  const [step, setStep] = useState<"input" | "running">("input");
  const [jdText, setJdText] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRun() {
    if (!jdText.trim() || loading) return;
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd_text: jdText.trim() }),
      });
      const data = await response.json();

      const app = createApplication("Target Role", "Company", "custom", data.job_id);
      updateApplication(app.id, { status: "pipeline" });

      setCreatedId(data.job_id);
      setStep("running");
    } catch (error) {
      console.error("Failed to start pipeline:", error);
    } finally {
      setLoading(false);
    }
  }

  function handlePipelineComplete() {
    if (!createdId) return;
    updateApplication(createdId, { status: "matched" });
    navigate(`/app/match/${createdId}`);
  }

  return (
    <>
      <PageHeader
        title="New application"
        sub="Paste any job description to run the AI tailoring pipeline."
      />

      {step === "input" ? (
        <Card className="p-6 sm:p-8">
          <div>
            <label htmlFor="jd-text" className="mb-2 block text-sm font-semibold">
              Job description
            </label>
            <textarea
              id="jd-text"
              rows={14}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              className="w-full resize-y rounded-2xl border border-ink/15 bg-cream/50 px-4 py-3 text-[15px] leading-relaxed outline-none placeholder:text-inksoft/60 focus:border-accent"
              placeholder="Paste the job description here…"
            />
          </div>

          <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-ink/8 pt-6 sm:flex-row sm:items-center">
            <p className="text-[13px] text-inksoft">
              The pipeline automatically extracts requirements, matches skills, and generates tailored resume content.
            </p>
            <Button size="lg" onClick={handleRun} disabled={!jdText.trim() || loading}>
              {loading ? "Starting…" : "Run pipeline"} <span aria-hidden>→</span>
            </Button>
          </div>
        </Card>
      ) : (
        <PipelineRunner jobId={createdId} jobTitle="Tailored Application" onComplete={handlePipelineComplete} />
      )}
    </>
  );
}
