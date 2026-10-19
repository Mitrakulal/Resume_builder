import { Link } from "react-router-dom";
import { ButtonLink, Card, EmptyState, PageHeader } from "../components/ui.tsx";
import { api } from "../lib/api.ts";
import {
  applicationCompany,
  applicationRole,
  STATUS_LABELS,
  type Application,
} from "../lib/types.ts";
import { statusColor, useApp } from "../store/AppContext.tsx";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function matchLabel(app: Application): string {
  const { matchedSkillsCount, missingSkillsCount } = app.summary;
  if (typeof matchedSkillsCount === "number" && matchedSkillsCount > 0) {
    return typeof missingSkillsCount === "number"
      ? `${matchedSkillsCount} matched / ${missingSkillsCount} gaps`
      : `${matchedSkillsCount} matched`;
  }
  if (typeof missingSkillsCount === "number" && missingSkillsCount > 0) {
    return `${missingSkillsCount} gaps`;
  }
  return "Not reported";
}

function ApplicationRow({ app }: { app: Application }) {
  const { deleteApplication } = useApp();
  const title = applicationRole(app);
  const company = applicationCompany(app);
  const canDownload = app.status === "matched" || Boolean(app.pdfUrl);

  const handleDelete = () => {
    const label = company ? `${title} at ${company}` : title;
    if (window.confirm(`Delete the application for ${label}?`)) {
      deleteApplication(app.id);
    }
  };

  return (
    <div className="border-b border-ink/8 px-4 py-4 last:border-0 sm:px-6 md:grid md:grid-cols-[2fr_1fr_1.3fr_1fr_auto] md:items-center md:gap-4">
      <div className="mb-2 md:mb-0">
        <p className="font-semibold text-ink">{title}</p>
        <p className="text-sm text-inksoft">{company || "Company not specified"}</p>
      </div>

      <div className="mb-2 md:mb-0">
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColor(app.status)}`}
        >
          {STATUS_LABELS[app.status]}
        </span>
      </div>

      <div className="mb-2 text-sm text-inksoft md:mb-0">{matchLabel(app)}</div>

      <div className="mb-2 text-sm text-inksoft md:mb-0">{formatDate(app.createdAt)}</div>

      <div className="flex flex-wrap gap-3 text-sm font-semibold">
        <Link to={`/app/match/${app.id}`} className="text-accentdeep hover:underline">
          Results
        </Link>
        {canDownload && (
          <a
            href={api.pdfUrl(app.jobId)}
            target="_blank"
            rel="noreferrer"
            className="text-accentdeep hover:underline"
          >
            PDF
          </a>
        )}
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
        sub={`${applications.length} saved application${
          applications.length === 1 ? "" : "s"
        } · stored in this browser`}
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
            className="hidden border-b border-ink/10 bg-parchment/60 px-4 py-3 text-xs font-semibold tracking-wider text-inksoft uppercase sm:px-6 md:grid md:grid-cols-[2fr_1fr_1.3fr_1fr_auto] md:gap-4"
            aria-hidden
          >
            <span>Role</span>
            <span>Status</span>
            <span>Match data</span>
            <span>Created</span>
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
