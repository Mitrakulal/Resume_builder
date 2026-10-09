import { Link } from "react-router-dom";
import { ButtonLink, Card, PageHeader, Reveal } from "../components/ui.tsx";
import { useApp, statusColor } from "../store/AppContext.tsx";
import { STATUS_LABELS, type Application, type ApplicationStatus } from "../data/demo.ts";

/* Map a status onto a 0–5 stage indicator. */
const STAGE_INDEX: Record<ApplicationStatus, number> = {
  draft: 0,
  pipeline: 2,
  matched: 3,
  letter: 4,
  ready: 5,
};

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
  const firstName = profile.personal_info.name.split(" ")[0] ?? "there";
  const daypart = daypartFor(new Date().getHours());

  const avgScore =
    applications.length > 0
      ? Math.round(applications.reduce((sum, a) => sum + a.matchScore, 0) / applications.length)
      : 0;
  const lettersReady = applications.filter((a) => a.status === "ready").length;
  const inPipeline = applications.filter((a) => a.status === "pipeline" || a.status === "draft").length;

  const latest: Application | undefined = applications[0];

  const activity: ActivityItem[] = applications
    .flatMap((a) => {
      const items: ActivityItem[] = [
        { key: `${a.id}-created`, text: `Created application for ${a.role} @ ${a.company}`, date: a.createdAt },
      ];
      if (a.status !== "draft") {
        items.push({
          key: `${a.id}-stage`,
          text: `Reached stage: ${STATUS_LABELS[a.status]}`,
          date: a.createdAt,
        });
      }
      return items;
    })
    .slice(0, 6);

  return (
    <>
      <PageHeader
        title={`Good ${daypart}, ${firstName}`}
        sub="Here's what's happening with your applications."
        actions={
          <ButtonLink to="/app/new" variant="primary">
            + New application
          </ButtonLink>
        }
      />

      {/* Stats */}
      <section aria-label="Application stats" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Reveal delay={0}>
          <StatCard value={String(applications.length)} label="Total applications" sub="All time" />
        </Reveal>
        <Reveal delay={0.06}>
          <StatCard value={`${avgScore}%`} label="Avg match score" sub="Across all applications" />
        </Reveal>
        <Reveal delay={0.12}>
          <StatCard value={String(lettersReady)} label="Letters ready" sub="Ready to send" />
        </Reveal>
        <Reveal delay={0.18}>
          <StatCard value={String(inPipeline)} label="In pipeline" sub="Drafts + running" />
        </Reveal>
      </section>

      {/* Latest pipeline + quick actions */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Reveal delay={0.05}>
          <Card className="h-full p-6">
            <h2 className="font-display text-xl font-semibold">Latest pipeline</h2>
            {latest ? (
              <div className="mt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {latest.role} <span className="text-inksoft">@ {latest.company}</span>
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(latest.status)}`}
                  >
                    {STATUS_LABELS[latest.status]}
                  </span>
                </div>
                {/* 5-dot stage indicator */}
                <div className="mt-4 flex items-center gap-2" aria-label={`Pipeline progress: ${STATUS_LABELS[latest.status]}`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className={`h-2.5 w-2.5 rounded-full ${i < STAGE_INDEX[latest.status] ? "bg-accent" : "bg-ink/10"}`}
                      aria-hidden
                    />
                  ))}
                </div>
                <Link
                  to={latest.status === "letter" || latest.status === "ready" ? `/app/letter/${latest.id}` : `/app/match/${latest.id}`}
                  className="mt-5 inline-flex items-center gap-1.5 font-semibold text-accentdeep transition-colors hover:text-accent"
                >
                  Continue <span aria-hidden>→</span>
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
                { to: "/app/portfolio", label: "Update portfolio", desc: "Keep your proof points sharp" },
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
                    <span aria-hidden className="text-accentdeep transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </div>

      {/* Recent activity */}
      <Reveal delay={0.05} className="mt-6">
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold">Recent activity</h2>
          {activity.length > 0 ? (
            <ul className="mt-4 space-y-0">
              {activity.map((item, i) => (
                <li key={item.key} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < activity.length - 1 && (
                    <span className="absolute top-5 left-[5px] h-full w-px bg-ink/10" aria-hidden />
                  )}
                  <span className="mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-accent bg-cream" aria-hidden />
                  <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4">
                    <p className="text-[15px]">{item.text}</p>
                    <time className="text-[13px] text-inksoft">{formatDate(item.date)}</time>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-inksoft">Nothing here yet — your pipeline runs will show up here.</p>
          )}
        </Card>
      </Reveal>
    </>
  );
}
