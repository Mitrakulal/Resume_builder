import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card } from "./ui.tsx";
import { api, getApiBase } from "../lib/api.ts";
import {
  PIPELINE_NODE_IDS,
  PIPELINE_STAGES,
  isNodeId,
  type NodeId,
  type PipelineDetails,
  type PipelineEvent,
} from "../lib/pipeline.ts";

type RunnerStatus = "running" | "completed" | "error";

interface PipelineRunnerProps {
  jobId: string;
  jobTitle: string;
  onEvent?: (event: PipelineEvent) => void;
  onComplete?: (pdfUrl?: string) => void;
  onError?: (message: string) => void;
}

interface NodePayload {
  node?: unknown;
  details?: PipelineDetails;
  pdf_url?: unknown;
}

interface CompletedPayload {
  pdf_url?: unknown;
}

interface ErrorPayload {
  error?: unknown;
}

function parseEventData<T>(event: Event): T | null {
  if (!(event instanceof MessageEvent) || !event.data) return null;
  try {
    return JSON.parse(event.data) as T;
  } catch {
    return null;
  }
}

/**
 * Subscribes to the real FastAPI SSE stream and maps backend graph nodes onto
 * the six visible pipeline stages. There are no timers or fake progress here.
 */
export function PipelineRunner({
  jobId,
  jobTitle,
  onEvent,
  onComplete,
  onError,
}: PipelineRunnerProps) {
  const [completed, setCompleted] = useState<NodeId[]>([]);
  const [status, setStatus] = useState<RunnerStatus>("running");
  const [error, setError] = useState<string | null>(null);
  const [connectionLost, setConnectionLost] = useState(false);

  const completedRef = useRef<NodeId[]>([]);
  const handlersRef = useRef({ onEvent, onComplete, onError });

  useEffect(() => {
    handlersRef.current = { onEvent, onComplete, onError };
  }, [onEvent, onComplete, onError]);

  useEffect(() => {
    if (!jobId) return;

    let closed = false;
    let stream: EventSource | null = null;
    let connectTimer: ReturnType<typeof setTimeout> | null = null;
    let completeTimer: ReturnType<typeof setTimeout> | null = null;
    completedRef.current = [];
    setCompleted([]);
    setStatus("running");
    setError(null);
    setConnectionLost(false);

    const markAlive = () => {
      if (closed) return;
      setConnectionLost(false);
      setError(null);
      setStatus((current) => (current === "completed" ? current : "running"));
    };

    const markNodeCompleted = (node: NodeId, details: PipelineDetails, hasPdf: boolean) => {
      if (completedRef.current.includes(node)) return;
      const next = [...completedRef.current, node];
      completedRef.current = next;
      setCompleted(next);
      handlersRef.current.onEvent?.({
        type: "node",
        node,
        details,
        pdfUrl: hasPdf ? api.pdfUrl(jobId) : undefined,
        completedNodes: next,
      });
    };

    const handleBackendError = (event: MessageEvent) => {
      if (closed) return;
      const payload = parseEventData<ErrorPayload>(event);
      const message =
        typeof payload?.error === "string" && payload.error.trim()
          ? payload.error
          : "The pipeline failed before producing a PDF.";
      setStatus("error");
      setError(message);
      setConnectionLost(false);
      stream?.close();
      handlersRef.current.onError?.(message);
    };

    const connect = () => {
      if (closed) return;
      stream = new EventSource(api.streamUrl(jobId));

      stream.addEventListener("start", () => {
        markAlive();
      });

      stream.addEventListener("node_progress", (event) => {
        if (closed) return;
        const payload = parseEventData<NodePayload>(event);
        if (!payload || typeof payload.node !== "string" || !isNodeId(payload.node)) return;
        markAlive();
        markNodeCompleted(
          payload.node,
          payload.details ?? {},
          typeof payload.pdf_url === "string",
        );
      });

      stream.addEventListener("completed", (event) => {
        if (closed) return;
        const payload = parseEventData<CompletedPayload>(event);
        const pdfUrl =
          typeof payload?.pdf_url === "string" ? api.pdfUrl(jobId) : undefined;

        completedRef.current = [...PIPELINE_NODE_IDS];
        setCompleted(completedRef.current);
        setStatus("completed");
        setConnectionLost(false);
        setError(null);
        stream?.close();

        handlersRef.current.onEvent?.({ type: "completed", pdfUrl });
        completeTimer = setTimeout(() => {
          if (!closed) handlersRef.current.onComplete?.(pdfUrl);
        }, 650);
      });

      stream.addEventListener("error", (event) => {
        if (event instanceof MessageEvent) {
          handleBackendError(event);
          return;
        }
        if (closed) return;

        setConnectionLost(true);
        if (stream?.readyState === EventSource.CLOSED) {
          const message =
            "Lost the live connection. The backend may still be finishing this job.";
          setStatus("error");
          setError(message);
          handlersRef.current.onError?.(message);
        }
      });
    };

    // Defer one tick so React StrictMode's development-only setup/cleanup
    // cycle cannot consume the single-consumer SSE queue before the real
    // connection is established.
    connectTimer = setTimeout(connect, 0);

    return () => {
      closed = true;
      if (connectTimer) clearTimeout(connectTimer);
      if (completeTimer) clearTimeout(completeTimer);
      stream?.close();
    };
  }, [jobId]);

  const total = PIPELINE_STAGES.length;
  const completedCount = completed.length;
  const isComplete = status === "completed";
  const activeIndex = isComplete
    ? -1
    : PIPELINE_STAGES.findIndex((stage) => !completed.includes(stage.id));
  const progressPct = isComplete ? 100 : (completedCount / total) * 100;

  const statusLabel = isComplete
    ? "All stages complete"
    : status === "error"
      ? "Pipeline stopped"
      : `Stage ${Math.min(completedCount + 1, total)} of ${total}`;

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display mt-1 text-2xl font-semibold sm:text-3xl">
            {isComplete ? "Resume ready" : "Running pipeline"}
          </h2>
          <p className="mt-1 text-inksoft">{jobTitle}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isComplete
              ? "bg-emerald-100 text-emerald-800"
              : status === "error"
                ? "bg-red-100 text-red-800"
                : "bg-amber-100 text-amber-800"
          }`}
          aria-live="polite"
        >
          {statusLabel}
        </span>
      </div>

      <div
        className="mt-6"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progressPct)}
        aria-label="Pipeline progress"
      >
        <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
          <motion.div
            className={`h-full rounded-full ${
              status === "error"
                ? "bg-red-500"
                : "bg-gradient-to-r from-accent to-accentdeep"
            }`}
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        <p className="mt-2 text-xs font-medium text-inksoft">
          {completedCount} of {total} nodes completed
          {connectionLost && " · reconnecting…"}
        </p>
      </div>

      <ol className="mt-6 space-y-5">
        {PIPELINE_STAGES.map((stage, index) => {
          const isDone = completed.includes(stage.id) || isComplete;
          const isActive = index === activeIndex;
          const isFailed = status === "error" && isActive;

          return (
            <li key={stage.id} className="flex gap-4">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center" aria-hidden>
                {isDone ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500">
                    <svg
                      viewBox="0 0 16 16"
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3.5 8.5l3.5 3.5 5.5-7" />
                    </svg>
                  </span>
                ) : isFailed ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
                    !
                  </span>
                ) : isActive ? (
                  <span className="relative flex h-7 w-7 items-center justify-center">
                    <span className="absolute h-full w-full animate-ping rounded-full bg-accent/40" />
                    <span className="relative h-3 w-3 rounded-full bg-accent" />
                  </span>
                ) : (
                  <span className="h-7 w-7 rounded-full border-2 border-ink/15" />
                )}
              </span>
              <div className={`min-w-0 flex-1 ${isDone || isActive ? "" : "opacity-50"}`}>
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h3 className={`text-[15px] ${isActive ? "font-semibold" : "font-medium"}`}>
                    {stage.title}
                  </h3>
                  {isDone && <span className="text-[13px] font-medium text-emerald-700">Done</span>}
                  {isActive && !isFailed && (
                    <span className="text-[13px] font-medium text-accentdeep">Running…</span>
                  )}
                  {isFailed && <span className="text-[13px] font-medium text-red-700">Failed</span>}
                  {!isDone && !isActive && (
                    <span className="text-[13px] font-medium text-inksoft">Queued</span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-inksoft">{stage.description}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <p className="font-semibold">The pipeline hit a problem</p>
          <p className="mt-1 break-words">{error}</p>
          {connectionLost && (
            <p className="mt-1 text-red-700">
              The backend job may still be running. Open the application to check for a PDF.
            </p>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-ink/8 pt-4">
        <p className="text-[13px] text-inksoft">
          Live EventSource stream from {getApiBase()}
        </p>
        <Link
          to={`/app/match/${jobId}`}
          className="text-sm font-semibold text-accentdeep hover:underline"
        >
          Open application →
        </Link>
      </div>
    </Card>
  );
}
