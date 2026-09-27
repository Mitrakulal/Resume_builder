import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Chip, PageHeader } from "../components/ui.tsx";
import { PipelineRunner } from "../components/PipelineRunner.tsx";
import { sampleJDs } from "../data/demo.ts";
import { useApp } from "../store/AppContext.tsx";

type Tab = "paste" | "upload" | "link";

const TABS: { id: Tab; label: string }[] = [
  { id: "paste", label: "Paste text" },
  { id: "upload", label: "Upload PDF" },
  { id: "link", label: "From link" },
];

export default function NewApplication() {
  const navigate = useNavigate();
  const { createApplication, updateApplication } = useApp();

  const [step, setStep] = useState<"input" | "running">("input");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("paste");
  const [jdId, setJdId] = useState(sampleJDs[0].id);
  const [role, setRole] = useState(sampleJDs[0].title);
  const [company, setCompany] = useState(sampleJDs[0].company);
  const [fileName, setFileName] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);

  function selectJD(id: string) {
    const jd = sampleJDs.find((j) => j.id === id);
    if (!jd) return;
    setJdId(jd.id);
    setRole(jd.title);
    setCompany(jd.company);
  }

  function handleFileChange(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    const jd = sampleJDs[1];
    setJdId(jd.id);
    setRole(jd.title);
    setCompany(jd.company);
  }

  function handleFetchLink() {
    if (!linkUrl.trim() || fetching) return;
    setFetching(true);
    setTimeout(() => {
      setFetching(false);
      setFetched(true);
      const jd = sampleJDs[2];
      setJdId(jd.id);
      setRole(jd.title);
      setCompany(jd.company);
    }, 900);
  }

  function handleRun() {
    if (!role.trim() || !company.trim()) return;
    const app = createApplication(role.trim(), company.trim(), jdId);
    updateApplication(app.id, { status: "pipeline" });
    setCreatedId(app.id);
    setStep("running");
  }

  function handlePipelineComplete() {
    if (!createdId) return;
    updateApplication(createdId, { status: "matched" });
    navigate(`/app/match/${createdId}`);
  }

  const selectedJD = sampleJDs.find((j) => j.id === jdId);

  return (
    <>
      <PageHeader
        title="New application"
        sub="Add a job description, then run the 5-stage pipeline."
      />

      {step === "input" ? (
        <Card className="p-6 sm:p-8">
          {/* Tabs */}
          <div className="inline-flex rounded-full bg-cream p-1" role="tablist" aria-label="Job description input method">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                  tab === t.id ? "bg-white text-ink shadow-soft" : "text-inksoft hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {tab === "paste" && (
              <div role="tabpanel">
                <label htmlFor="jd-text" className="mb-2 block text-sm font-semibold">
                  Job description
                </label>
                <textarea
                  id="jd-text"
                  rows={10}
                  defaultValue={sampleJDs[0].text}
                  className="w-full resize-y rounded-2xl border border-ink/15 bg-cream/50 px-4 py-3 text-[15px] leading-relaxed outline-none placeholder:text-inksoft/60 focus:border-accent"
                  placeholder="Paste the job description here…"
                />
              </div>
            )}

            {tab === "upload" && (
              <div role="tabpanel">
                <label
                  htmlFor="jd-file"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink/20 bg-cream/50 px-6 py-12 text-center transition-colors hover:border-accent"
                >
                  <svg viewBox="0 0 24 24" className="h-10 w-10 text-accentdeep" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
                    <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                  </svg>
                  <span className="mt-3 font-semibold">Drop a PDF here or click to browse</span>
                  <span className="mt-1 text-sm text-inksoft">PDF only, up to 10 MB</span>
                  <input
                    id="jd-file"
                    type="file"
                    accept=".pdf"
                    className="sr-only"
                    onChange={(e) => handleFileChange(e.target.files?.[0])}
                  />
                </label>
                {fileName && (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Chip>{fileName}</Chip>
                    <p className="text-[13px] text-inksoft">Parsed with demo JD #2 (simulated)</p>
                  </div>
                )}
              </div>
            )}

            {tab === "link" && (
              <div role="tabpanel">
                <label htmlFor="jd-link" className="mb-2 block text-sm font-semibold">
                  Job posting URL
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="jd-link"
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://…"
                    className="flex-1 rounded-2xl border border-ink/15 bg-cream/50 px-4 py-3 text-[15px] outline-none placeholder:text-inksoft/60 focus:border-accent"
                  />
                  <Button variant="dark" onClick={handleFetchLink} disabled={fetching || !linkUrl.trim()}>
                    {fetching ? "Fetching…" : "Fetch JD"}
                  </Button>
                </div>
                {fetched && (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
                    <span aria-hidden>✓</span> Fetched (simulated)
                  </p>
                )}
              </div>
            )}
          </div>

          {/* JD source select */}
          <div className="mt-8 grid gap-6 border-t border-ink/8 pt-6 sm:grid-cols-2">
            <div>
              <label htmlFor="jd-select" className="mb-2 block text-sm font-semibold">
                Sample JD to match against
              </label>
              <select
                id="jd-select"
                value={jdId}
                onChange={(e) => selectJD(e.target.value)}
                className="w-full cursor-pointer rounded-2xl border border-ink/15 bg-cream/50 px-4 py-3 text-[15px] outline-none focus:border-accent"
              >
                {sampleJDs.map((jd) => (
                  <option key={jd.id} value={jd.id}>
                    {jd.title} — {jd.company}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[13px] text-inksoft">
                The pipeline matches against the chosen sample{selectedJD ? ` (${selectedJD.sourceLabel})` : ""}.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="target-role" className="mb-2 block text-sm font-semibold">
                  Target role
                </label>
                <input
                  id="target-role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-2xl border border-ink/15 bg-cream/50 px-4 py-3 text-[15px] outline-none focus:border-accent"
                />
              </div>
              <div>
                <label htmlFor="target-company" className="mb-2 block text-sm font-semibold">
                  Company
                </label>
                <input
                  id="target-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full rounded-2xl border border-ink/15 bg-cream/50 px-4 py-3 text-[15px] outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button size="lg" onClick={handleRun} disabled={!role.trim() || !company.trim()}>
              Run pipeline <span aria-hidden>→</span>
            </Button>
          </div>
        </Card>
      ) : (
        <PipelineRunner jobTitle={`${role} @ ${company}`} onComplete={handlePipelineComplete} />
      )}
    </>
  );
}
