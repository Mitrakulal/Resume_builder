import { Link } from "react-router-dom";
import { ButtonLink, Card, PageHeader, Reveal } from "../components/ui.tsx";
import { PIPELINE_STAGES } from "../lib/pipeline.ts";
import {
  applicationCompany,
  applicationRole,
  STATUS_LABELS,
  type Application,
} from "../lib/types.ts";
import { statusColor, useApp } from "../store/AppContext.tsx";

function daypartFor(hour: number): string {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function StatCard({ value, label, sub }: { value: string; label: string; sub: string }) {
  return (
    <Card className="p-5 sm:p-6">
      <p className="font-display text-4xl font-semibold">{value}</p>
      <p className="mt-1.5 font-medium">{label}</p>
      <p className="mt-0.5 text-[13px] text-inksoft">{sub}</p>
    </Card>
  );
}

interface ActivityItem {
  key: string;
  text: string;
  date: string;
}

export default function Dashboard() {
  const { profile, applications } = useApp();
  const firstName = profile?.personal_info.name.trim().split(/\s+/)[0] || "there";
  const daypart = daypartFor(new Date().getHours());

  const resumesReady = applications.filter((app) => app.status === "matched").length;
  const inPipeline = applications.filter((app) => app.status === "pipeline").length;
  const failed = applications.filter((app) => app.status === "failed").length;

  const latest: Application | undefined = applications[0];

  const activity: ActivityItem[] = applications
    .flatMap((app) => {
      const title = applicationRole(app);
      const company = applicationCompany(app);
      const label = company ? `${title} at ${company}` : title;
      const items: ActivityItem[] = [
        {
          key: `${app.id}-created`,
          text: `Started tailoring for ${label}`,
          date: app.createdAt,
        },
      ];

      if (app.status === "matched") {
        items.push({
          key: `${app.id}-ready`,
          text: `Resume ready for ${label} — all ${PIPELINE_STAGES.length} stages complete`,
          date: app.updatedAt,
        });
      } else if (app.status === "failed") {
        items.push({
          key: `${app.id}-failed`,
          text: `Pipeline failed for ${label}`,
          date: app.updatedAt,
        });
      } else if (app.completedNodes.length > 0) {
        items.push({
          key: `${app.id}-progress`,
          text: `Pipeline progressed for ${label} — ${app.completedNodes.length}/${
            PIPELINE_STAGES.length
          } stages`,
          date: app.updatedAt,
        });
      }

      return items;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <>
      <PageHeader
        title={`Good ${daypart}, ${firstName}`}
        sub="Here's what's happening with your tailored resumes."
        actions={
          <ButtonLink to="/app/new" variant="primary">
            + New application
          </ButtonLink>
        }
      />

      <section aria-label="Application stats" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Reveal delay={0}>
          <StatCard value={String(applications.length)} label="Total applications" sub="All time" />
        </Reveal>
        <Reveal delay={0.06}>
          <StatCard value={String(resumesReady)} label="Resumes ready" sub="Compiled PDFs" />
        </Reveal>
        <Reveal delay={0.12}>
          <StatCard value={String(inPipeline)} label="In pipeline" sub="Currently running" />
        </Reveal>
        <Reveal delay={0.18}>
          <StatCard value={String(failed)} label="Needs attention" sub="Failed runs" />
        </Reveal>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Reveal delay={0.05}>
          <Card className="h-full p-6">
            <h2 className="font-display text-xl font-semibold">Latest pipeline</h2>
            {latest ? (
              <div className="mt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {applicationRole(latest)}{" "}
                    {applicationCompany(latest) && (
                      <span className="text-inksoft">@ {applicationCompany(latest)}</span>
                    )}
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(
                      latest.status,
                    )}`}
                  >
                    {STATUS_LABELS[latest.status]}
                  </span>
                </div>

                <div
                  className="mt-4 flex items-center gap-2"
                  aria-label={`Pipeline progress: ${latest.completedNodes.length} of ${
                    PIPELINE_STAGES.length
                  } stages`}
                >
                  {PIPELINE_STAGES.map((stage, index) => {
                    const filled =
                      latest.status === "matched" || index < latest.completedNodes.length;
                    const failedHere =
                      latest.status === "failed" &&
                      index === latest.completedNodes.length;
                    return (
                      <span
                        key={stage.id}
                        className={`h-2.5 w-2.5 rounded-full ${
                          failedHere
                            ? "bg-red-500"
                            : filled
                              ? "bg-accent"
                              : "bg-ink/10"
                        }`}
                        aria-hidden
                      />
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-inksoft">
                  {latest.status === "matched"
                    ? `${PIPELINE_STAGES.length} of ${PIPELINE_STAGES.length} stages complete`
                    : `${latest.completedNodes.length} of ${PIPELINE_STAGES.length} stages complete`}
                </p>

                <Link
                  to={`/app/match/${latest.id}`}
                  className="mt-5 inline-flex items-center gap-1.5 font-semibold text-accentdeep transition-colors hover:text-accent"
                >
                  {latest.status === "matched" ? "View resume" : "View progress"}{" "}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            ) : (
              <p className="mt-4 text-inksoft">No applications yet — start your first one.</p>
            )}
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="h-full p-6">
            <h2 className="font-display text-xl font-semibold">Quick actions</h2>
            <ul className="mt-4 divide-y divide-ink/8">
              {[
                { to: "/app/new", label: "Start new application", desc: "Paste a JD and run the pipeline" },
                { to: "/app/applications", label: "Review applications", desc: "Track every role you're chasing" },
                { to: "/app/portfolio", label: "Update portfolio", desc: "Keep your source profile sharp" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="group flex items-center justify-between gap-3 rounded-2xl px-3 py-3.5 transition-colors hover:bg-cream"
                  >
                    <span>
                      <span className="block font-medium">{item.label}</span>
                      <span className="block text-[13px] text-inksoft">{item.desc}</span>
                    </span>
                    <span
                      aria-hidden
                      className="text-accentdeep transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={0.05} className="mt-6">
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold">Recent activity</h2>
          {activity.length > 0 ? (
            <ul className="mt-4 space-y-0">
              {activity.map((item, index) => (
                <li key={item.key} className="relative flex gap-4 pb-5 last:pb-0">
                  {index < activity.length - 1 && (
                    <span
                      className="absolute top-5 left-[5px] h-full w-px bg-ink/10"
                      aria-hidden
                    />
                  )}
                  <span
                    className="mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-accent bg-cream"
                    aria-hidden
                  />
                  <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4">
                    <p className="text-[15px]">{item.text}</p>
                    <time className="text-[13px] text-inksoft">{formatDate(item.date)}</time>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-inksoft">
              Nothing here yet — your pipeline runs will show up here.
            </p>
          )}
        </Card>
      </Reveal>
    </>
  );
}
