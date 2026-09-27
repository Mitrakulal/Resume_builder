import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ButtonLink, Card, EmptyState, PageHeader } from "../components/ui.tsx";
import { statusColor, useApp } from "../store/AppContext.tsx";
import { STATUS_LABELS } from "../data/demo.ts";
import type { Application } from "../data/demo.ts";

function MatchBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-ink/8">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-sm font-semibold">{score}%</span>
    </div>
  );
}

function ApplicationRow({ app }: { app: Application }) {
  const { deleteApplication } = useApp();
  const date = new Date(app.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleDelete = () => {
    if (window.confirm(`Delete the application for ${app.role} at ${app.company}?`)) {
      deleteApplication(app.id);
    }
  };

  return (
    <div className="border-b border-ink/8 px-4 py-4 last:border-0 sm:px-6 md:grid md:grid-cols-[2fr_1fr_1.4fr_1fr_1fr_auto] md:items-center md:gap-4">
      {/* Role */}
      <div className="mb-2 md:mb-0">
        <p className="font-semibold text-ink">{app.role}</p>
        <p className="text-sm text-inksoft">{app.company}</p>
      </div>
      {/* Status */}
      <div className="mb-2 md:mb-0">
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColor(app.status)}`}
        >
          {STATUS_LABELS[app.status]}
        </span>
      </div>
      {/* Match */}
      <div className="mb-2 md:mb-0">
        <MatchBar score={app.matchScore} />
      </div>
      {/* Date */}
      <div className="mb-2 text-sm text-inksoft md:mb-0">{date}</div>
      {/* Tone */}
      <div className="mb-3 text-sm text-ink md:mb-0">{app.tone}</div>
      {/* Actions */}
      <div className="flex gap-3 text-sm font-semibold">
        <Link to={`/app/match/${app.id}`} className="text-accentdeep hover:underline">
          Match
        </Link>
        <Link to={`/app/letter/${app.id}`} className="text-accentdeep hover:underline">
          Letter
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          className="cursor-pointer text-red-700 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function Applications() {
  const { applications } = useApp();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Applications"
        sub={`${applications.length} total · demo data`}
        actions={
          <ButtonLink to="/app/new" size="sm">
            + New application
          </ButtonLink>
        }
      />

      {applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          copy="Create your first application — paste a job description and let the pipeline do the rest."
          action={
            <ButtonLink to="/app/new" size="sm">
              + New application
            </ButtonLink>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div
            className="hidden border-b border-ink/10 bg-parchment/60 px-4 py-3 text-xs font-semibold tracking-wider text-inksoft uppercase sm:px-6 md:grid md:grid-cols-[2fr_1fr_1.4fr_1fr_1fr_auto] md:gap-4"
            aria-hidden
          >
            <span>Role</span>
            <span>Status</span>
            <span>Match</span>
            <span>Date</span>
            <span>Tone</span>
            <span>Actions</span>
          </div>
          {applications.map((app) => (
            <ApplicationRow key={app.id} app={app} />
          ))}
        </Card>
      )}
    </div>
  );
}
