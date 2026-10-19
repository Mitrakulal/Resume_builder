import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, ButtonLink, Card, Chip, EmptyState, PageHeader } from "../components/ui.tsx";
import { ScoreRing } from "../components/ScoreRing.tsx";
import { api, errorMessage } from "../lib/api.ts";
import {
  applicationCompany,
  applicationRole,
  STATUS_LABELS,
  type JDRequirements,
  type MatchedItems,
  type ResumeContent,
  type TailorResult,
} from "../lib/types.ts";
import { statusColor, useApp } from "../store/AppContext.tsx";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function count(value: number | null | undefined): string {
  return typeof value === "number" ? String(value) : "—";
}

function RequirementsCard({ jd }: { jd: JDRequirements }) {
  const mustHave = jd.must_have_skills ?? [];
  const niceToHave = jd.nice_to_have_skills ?? [];
  const responsibilities = jd.key_responsibilities ?? [];
  const keywords = jd.keywords ?? [];

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">What the job asks for</h2>
          <p className="mt-1 text-sm text-inksoft">
            Parsed directly from the job description by the <code>read_jd</code> node.
          </p>
        </div>
        {typeof jd.experience_years === "number" && (
          <Chip>{jd.experience_years}+ years</Chip>
        )}
      </div>

      {mustHave.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold tracking-[0.14em] text-inksoft uppercase">
            Must-have skills
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {mustHave.map((skill) => (
              <Chip key={skill} className="border border-accent/30 bg-accent/10 text-accentdeep">
                {skill}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {niceToHave.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold tracking-[0.14em] text-inksoft uppercase">
            Nice to have
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {niceToHave.map((skill) => (
              <Chip key={skill} className="border border-ink/20 bg-transparent text-inksoft">
                {skill}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {responsibilities.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold tracking-[0.14em] text-inksoft uppercase">
            Responsibilities
          </p>
          <ul className="mt-2 space-y-1.5">
            {responsibilities.map((item) => (
              <li key={item} className="flex gap-2.5 text-[15px]">
                <span className="mt-0.5 text-emerald-600" aria-hidden>
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {keywords.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold tracking-[0.14em] text-inksoft uppercase">
            Keywords
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-md bg-cream px-2 py-1 font-mono text-[13px] text-inksoft"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function MatchCard({ matched }: { matched: MatchedItems }) {
  return (
    <Card className="p-6 sm:p-8">
      <h2 className="font-display text-xl font-semibold">How the profile matched</h2>
      <p className="mt-1 text-sm text-inksoft">
        Returned by the <code>match</code> node. Scoring is deterministic in the current backend.
      </p>

      <div className="mt-5">
        <p className="text-xs font-semibold tracking-[0.14em] text-inksoft uppercase">
          Matched skills
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {matched.matched_skills.length > 0 ? (
            matched.matched_skills.map((skill) => (
              <Chip key={skill} className="border border-emerald-200 bg-emerald-50 text-emerald-900">
                {skill}
              </Chip>
            ))
          ) : (
            <p className="text-sm text-inksoft">No matched skills reported.</p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold tracking-[0.14em] text-inksoft uppercase">
          Gap areas
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {matched.gap_areas.length > 0 ? (
            matched.gap_areas.map((gap) => (
              <Chip key={gap} className="border border-red-200 bg-red-50 text-red-800">
                {gap}
              </Chip>
            ))
          ) : (
            <p className="text-sm text-inksoft">No gaps reported.</p>
          )}
        </div>
      </div>

      {matched.matched_experience.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold tracking-[0.14em] text-inksoft uppercase">
            Matching experience
          </p>
          <ul className="mt-2 space-y-2">
            {matched.matched_experience.map((item) => (
              <li key={item} className="rounded-xl border border-ink/10 bg-cream/40 px-3.5 py-2.5 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

function GeneratedResumeCard({ content }: { content: ResumeContent }) {
  const experience = content.experience_section ?? [];
  const projects = content.projects_section ?? [];
  const skills = content.skills_section ?? [];
  const education = content.education_section ?? [];
  const certifications = content.certifications_section ?? [];

  return (
    <Card className="p-6 sm:p-8">
      <h2 className="font-display text-xl font-semibold">Generated resume content</h2>
      <p className="mt-1 text-sm text-inksoft">
        The structured output of the <code>generate_content</code> node, before LaTeX rendering.
      </p>

      {content.professional_summary && (
        <div className="mt-5">
          <p className="text-xs font-semibold tracking-[0.14em] text-inksoft uppercase">Summary</p>
          <p className="mt-2 text-[15px] leading-relaxed">{content.professional_summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold tracking-[0.14em] text-inksoft uppercase">Experience</p>
          <div className="mt-3 space-y-5">
            {experience.map((item, index) => (
              <div key={`${item.company ?? "company"}-${index}`} className="border-l-2 border-accent/40 pl-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">
                    {item.role || item.title || "Role"}
                    {(item.company || item.organization) && (
                      <span className="text-accentdeep"> @ {item.company || item.organization}</span>
                    )}
                  </p>
                  <p className="text-xs text-inksoft">{item.date || item.dates || ""}</p>
                </div>
                {item.bullets && item.bullets.length > 0 ? (
                  <ul className="mt-2 space-y-1.5">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2 text-sm leading-relaxed">
                        <span className="text-accent" aria-hidden>
                          •
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  item.description && <p className="mt-1 text-sm leading-relaxed">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold tracking-[0.14em] text-inksoft uppercase">Projects</p>
          <div className="mt-3 space-y-4">
            {projects.map((item, index) => (
              <div key={`${item.name}-${index}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-inksoft">{item.date || ""}</p>
                </div>
                {item.technologies && (
                  <p className="font-mono text-xs text-accentdeep">{item.technologies}</p>
                )}
                {item.bullets && item.bullets.length > 0 ? (
                  <ul className="mt-1.5 space-y-1.5">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2 text-sm leading-relaxed">
                        <span className="text-accent" aria-hidden>
                          •
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  item.description && <p className="mt-1 text-sm leading-relaxed">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold tracking-[0.14em] text-inksoft uppercase">Skills</p>
          <div className="mt-3 space-y-2">
            {skills.map((category) => (
              <p key={category.category} className="text-sm">
                <span className="font-semibold">{category.category}:</span>{" "}
                <span className="text-inksoft">{category.skills.join(", ")}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {education.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold tracking-[0.14em] text-inksoft uppercase">Education</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {education.map((item, index) => (
              <li key={`${item.institution}-${index}`}>
                <span className="font-semibold">{item.institution || item.school}</span>
                {item.degree && <span className="text-inksoft"> — {item.degree}</span>}
                {item.date && <span className="text-inksoft"> · {item.date}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {certifications.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold tracking-[0.14em] text-inksoft uppercase">
            Certifications
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {certifications.map((certification) => (
              <li key={certification}>• {certification}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

export default function MatchResults() {
  const { id } = useParams();
  const { getApplication } = useApp();
  const app = getApplication(id ?? "");

  const [result, setResult] = useState<TailorResult | null>(null);
  const [resultLoading, setResultLoading] = useState(false);
  const [resultError, setResultError] = useState<string | null>(null);

  const jobId = app?.jobId;

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    setResult(null);
    setResultError(null);
    setResultLoading(true);

    api
      .getTailorResult(jobId)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((error) => {
        if (!cancelled) setResultError(errorMessage(error));
      })
      .finally(() => {
        if (!cancelled) setResultLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const openPdf = useCallback(() => {
    if (!app) return;
    window.open(api.pdfUrl(app.jobId), "_blank", "noopener,noreferrer");
  }, [app]);

  if (!app) {
    return (
      <>
        <PageHeader title="Match results" sub="The tailored resume and match details for this application." />
        <EmptyState
          title="Application not found"
          copy="This application doesn't exist in this browser. It may have been deleted."
          action={<ButtonLink to="/app/applications">Back to applications</ButtonLink>}
        />
      </>
    );
  }

  const jd = result?.jd_requirements ?? null;
  const matched = result?.matched_items ?? null;
  const content = result?.resume_content ?? null;
  const resultTitle = jd?.job_title?.trim() ?? "";
  const role =
    resultTitle && resultTitle.toLowerCase() !== "unknown"
      ? resultTitle
      : applicationRole(app);
  const resultCompany = jd?.company?.trim() ?? "";
  const company =
    applicationCompany(app) ||
    (resultCompany && resultCompany.toLowerCase() !== "unknown" ? resultCompany : "");
  const canDownload = app.status === "matched" || Boolean(app.pdfUrl);
  const pdfUrl = api.pdfUrl(app.jobId);

  const matchedCount = matched
    ? matched.matched_skills.length
    : app.summary.matchedSkillsCount;
  const gapCount = matched ? matched.gap_areas.length : app.summary.missingSkillsCount;
  const requiredCount = jd
    ? (jd.must_have_skills ?? []).length
    : app.summary.requiredSkillsCount;
  const hasCounts =
    (typeof matchedCount === "number" && matchedCount > 0) ||
    (typeof gapCount === "number" && gapCount > 0) ||
    (typeof requiredCount === "number" && requiredCount > 0);

  return (
    <>
      <PageHeader
        title={role}
        sub={[company, formatDate(app.createdAt)].filter(Boolean).join(" · ")}
        actions={
          <>
            <ButtonLink to="/app/applications" variant="ghost">
              <span aria-hidden>←</span> Applications
            </ButtonLink>
            <Button onClick={openPdf} disabled={!canDownload}>
              Download Resume PDF <span aria-hidden>↓</span>
            </Button>
          </>
        }
      />

      {app.error && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <p className="font-semibold">The last pipeline run failed</p>
          <p className="mt-1 break-words">{app.error}</p>
        </div>
      )}

      {/* Status + match summary */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Card className="p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">Application status</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(app.status)}`}
            >
              {STATUS_LABELS[app.status]}
            </span>
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-inksoft">Pipeline nodes</dt>
              <dd className="font-semibold">{app.completedNodes.length} / 6</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-inksoft">Created</dt>
              <dd className="font-semibold">{formatDate(app.createdAt)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-inksoft">Job id</dt>
              <dd className="font-mono text-xs">{app.jobId}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-inksoft">Result endpoint</dt>
              <dd className="text-xs font-semibold">
                {resultLoading ? "Checking…" : result ? "Available" : "Not available"}
              </dd>
            </div>
          </dl>

          {matched && matched.relevance_score > 0 ? (
            <div className="mt-6 flex justify-center border-t border-ink/8 pt-5">
              <ScoreRing score={Math.round(matched.relevance_score)} />
            </div>
          ) : (
            <p className="mt-6 border-t border-ink/8 pt-4 text-[13px] text-inksoft">
              No relevance score has been reported for this run.
            </p>
          )}
        </Card>

        <Card className="p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">Match summary</h2>
          <p className="mt-1 text-sm text-inksoft">
            Counts come from the live pipeline events or the result endpoint when available.
          </p>

          {hasCounts ? (
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-cream/60 p-4 text-center">
                <p className="font-display text-3xl font-semibold">{count(requiredCount)}</p>
                <p className="mt-1 text-xs font-medium text-inksoft">Required skills</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                <p className="font-display text-3xl font-semibold text-emerald-800">
                  {count(matchedCount)}
                </p>
                <p className="mt-1 text-xs font-medium text-emerald-800">Matched</p>
              </div>
              <div className="rounded-2xl bg-red-50 p-4 text-center">
                <p className="font-display text-3xl font-semibold text-red-800">{count(gapCount)}</p>
                <p className="mt-1 text-xs font-medium text-red-800">Gaps</p>
              </div>
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-ink/15 bg-cream/40 px-4 py-6 text-sm text-inksoft">
              The backend did not report match counts for this run. The current API streams only
              node completion events, and some of its detail fields are still being wired up.
            </p>
          )}

          {resultError && (
            <p className="mt-4 text-[13px] text-red-700">
              Could not load the detailed result: {resultError}
            </p>
          )}

          {!resultLoading && !result && (
            <div className="mt-5 rounded-2xl bg-peach/60 px-4 py-4 text-[13px] leading-relaxed text-inksoft">
              <p className="font-semibold text-ink">Detailed result endpoint pending</p>
              <p className="mt-1">
                This page is ready to render <code>GET /api/tailor/{"{job_id}"}/result</code>. Until
                the backend exposes it, you still get the submitted JD, live progress counts, and
                the compiled PDF.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Real result data when the endpoint exists */}
      {result && (
        <div className="mt-6 space-y-6">
          {jd && <RequirementsCard jd={jd} />}
          {matched && <MatchCard matched={matched} />}
          {content && <GeneratedResumeCard content={content} />}
        </div>
      )}

      {/* Submitted JD fallback */}
      {!result && (
        <Card className="mt-6 p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">Job description you submitted</h2>
          <p className="mt-1 text-sm text-inksoft">
            Stored in this browser with the application so you can review it later.
          </p>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-2xl border border-ink/10 bg-cream/40 p-4 font-sans text-sm leading-relaxed">
            {app.jdText || "No job description was saved for this application."}
          </pre>
        </Card>
      )}

      {/* PDF */}
      <Card className="mt-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">Generated resume PDF</h2>
            <p className="mt-1 text-[15px] text-inksoft">
              {canDownload
                ? "Compiled by the backend and served from the job-specific PDF endpoint."
                : "The PDF appears here after the compile node completes."}
            </p>
          </div>
          <Button onClick={openPdf} variant="dark" disabled={!canDownload}>
            Download PDF <span aria-hidden>↓</span>
          </Button>
        </div>

        {canDownload ? (
          <div className="mt-6 aspect-[1/1.4] w-full overflow-hidden rounded-xl border-2 border-ink/10 bg-ink/5">
            <iframe src={pdfUrl} className="h-full w-full" title="Resume PDF preview" />
          </div>
        ) : (
          <div className="mt-6 flex min-h-56 items-center justify-center rounded-xl border-2 border-dashed border-ink/15 bg-cream/40 px-6 text-center">
            <p className="max-w-md text-sm text-inksoft">
              {app.status === "failed"
                ? "No PDF was produced because the pipeline failed. Check the error above."
                : "The pipeline is still running. This page will show the PDF once the job is complete."}
            </p>
          </div>
        )}
      </Card>

      {canDownload && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <Button size="lg" onClick={openPdf}>
            Download Tailored Resume <span aria-hidden>↓</span>
          </Button>
          <p className="text-[13px] text-inksoft">
            Generated by your local FastAPI + LangGraph backend.
          </p>
        </div>
      )}
    </>
  );
}
