import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Button, ButtonLink, Card, Chip, EmptyState, PageHeader } from "../components/ui.tsx";
import { ScoreRing } from "../components/ScoreRing.tsx";
import { MatchBar } from "../components/MatchBar.tsx";
import { useApp } from "../store/AppContext.tsx";
import { getJD, matchData } from "../data/demo.ts";

export default function MatchResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getApplication, updateApplication } = useApp();

  const app = getApplication(id ?? "");

  if (!app) {
    return (
      <>
        <PageHeader title="Match results" sub="Skill-to-JD breakdown for this application." />
        <EmptyState
          title="Application not found"
          copy="This application doesn't exist or was deleted."
          action={<ButtonLink to="/app/applications">Back to applications</ButtonLink>}
        />
      </>
    );
  }

  const jd = getJD(app.jdId);
  const data = matchData[app.jdId] ?? matchData["jd-frontend"];

  function handleDownloadPDF() {
    window.open(`http://127.0.0.1:8000/api/tailor/${id}/pdf`, "_blank");
  }

  return (
    <>
      <PageHeader
        title={app.role}
        sub={`${app.company} · JD: ${jd.sourceLabel} · ${jd.postedDate}`}
        actions={
          <>
            <ButtonLink to="/app/applications" variant="ghost">
              <span aria-hidden>←</span> Applications
            </ButtonLink>
            <Button onClick={handleDownloadPDF}>
              Download Resume PDF <span aria-hidden>↓</span>
            </Button>
          </>
        }
      />

      {/* Score + JD requirements */}
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="flex flex-col items-center justify-center p-6 text-center sm:p-8">
          <ScoreRing score={data.score} />
          <h2 className="font-display mt-4 text-lg font-semibold">Overall match</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-inksoft">
            Your portfolio covers {data.skillMatches.filter((s) => s.score >= 70).length} of{" "}
            {data.skillMatches.length} matched skills against this JD's requirements.
          </p>
        </Card>

        <Card className="p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">What the JD asks for</h2>

          <div className="mt-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-inksoft uppercase">Must-have</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {jd.requirements.mustHave.map((skill) => (
                <Chip key={skill} className="border border-accent/30 bg-accent/10 text-accentdeep">
                  {skill}
                </Chip>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold tracking-[0.14em] text-inksoft uppercase">Nice to have</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {jd.requirements.niceToHave.map((skill) => (
                <Chip key={skill} className="border border-ink/20 bg-transparent text-inksoft">
                  {skill}
                </Chip>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-inksoft uppercase">Responsibilities</p>
            <ul className="mt-2 space-y-1.5">
              {jd.requirements.responsibilities.map((r) => (
                <li key={r} className="flex gap-2.5 text-[15px]">
                  <span className="mt-0.5 text-emerald-600" aria-hidden>
                    ✓
                  </span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-inksoft uppercase">Keywords</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {jd.requirements.keywords.map((kw) => (
                <span key={kw} className="rounded-md bg-cream px-2 py-1 font-mono text-[13px] text-inksoft">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* PDF Preview */}
      <Card className="mt-6 p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Generated Resume</h2>
            <p className="mt-1 text-[15px] text-inksoft">Preview your tailored PDF.</p>
          </div>
          <Button onClick={handleDownloadPDF} variant="dark">
            Download PDF <span aria-hidden>↓</span>
          </Button>
        </div>
        <div className="mt-6 aspect-[1/1.4] w-full overflow-hidden rounded-xl border-2 border-ink/10 bg-ink/5">
          <iframe 
            src={`http://127.0.0.1:8000/api/tailor/${id}/pdf`}
            className="h-full w-full"
            title="Resume PDF Preview"
          />
        </div>
      </Card>

      {/* Skill matches */}
      <Card className="mt-6 p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">Skill matches</h2>
        <p className="mt-1 text-[15px] text-inksoft">How each of your skills lines up with the JD.</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {data.skillMatches.map((s) => (
            <MatchBar
              key={s.skill}
              skill={s.skill}
              score={s.score}
              requirement={s.matchedRequirement}
              source={s.source}
            />
          ))}
        </div>
      </Card>

      {/* Strongest proof */}
      <section aria-label="Strongest proof" className="mt-6">
        <h2 className="font-display text-xl font-semibold">Strongest proof</h2>
        <p className="mt-1 text-[15px] text-inksoft">The portfolio entries the matcher leaned on most.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {data.entryMatches.map((entry) => (
            <Card key={entry.entryId} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{entry.title}</h3>
                  <p className="text-[13px] text-inksoft">{entry.subtitle}</p>
                </div>
                <span className="font-display text-lg font-semibold text-accent">{entry.relevance}%</span>
              </div>
              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/8"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={entry.relevance}
                aria-label={`${entry.title} relevance`}
              >
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accentdeep"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${entry.relevance}%` }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <div className="mt-4">
                <Chip className="!text-xs">{entry.matchedRequirement}</Chip>
              </div>
              <blockquote className="mt-3 border-l-2 border-accent pl-3 text-[15px] text-inksoft italic">
                “{entry.highlight}”
              </blockquote>
            </Card>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <Button size="lg" onClick={handleDownloadPDF}>
          Download Tailored Resume <span aria-hidden>↓</span>
        </Button>
        <p className="text-[13px] text-inksoft">Generated by your local AI in FastAPI!</p>
      </div>
    </>
  );
}
