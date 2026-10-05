import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, DemoBadge } from "./ui.tsx";
import { PIPELINE_STAGES } from "../lib/pipeline.ts";

/**
 * Animated 5-stage pipeline simulation. Drives itself with timers from
 * PIPELINE_STAGES durations, rotates activity lines every 900ms, then
 * fires onComplete exactly once after a short hold on the "done" state.
 */
export function PipelineRunner({ jobId, jobTitle, onComplete }: { jobId?: string | null; jobTitle: string; onComplete: () => void }) {
  const [stageIndex, setStageIndex] = useState(0);
  const [activityIndex, setActivityIndex] = useState(0);

  const done = stageIndex >= PIPELINE_STAGES.length;

  // Listen to the real backend stream using EventSource
  useEffect(() => {
    if (!jobId) return;
    const sse = new EventSource(`http://127.0.0.1:8000/api/tailor/${jobId}/stream`);

    sse.addEventListener("start", () => setStageIndex(0));
    
    sse.addEventListener("node_progress", (e) => {
      const data = JSON.parse(e.data);
      const nodeToStage: Record<string, number> = {
        read_jd: 1,
        load_profile: 2,
        match: 3,
        generate_content: 4,
        render: 5,
        compile: 5
      };
      if (nodeToStage[data.node]) {
        setStageIndex(nodeToStage[data.node]);
      }
    });

    sse.addEventListener("completed", () => {
      sse.close();
      setStageIndex(PIPELINE_STAGES.length);
      setTimeout(onComplete, 800); // slight delay so the user sees the final checkmark
    });

    sse.onerror = () => sse.close();
    return () => sse.close();
  }, [jobId, onComplete]);

  // Rotate the activity line while a stage is running
  useEffect(() => {
    if (done) return;
    const count = PIPELINE_STAGES[stageIndex]?.activity.length || 1;
    const t = setInterval(() => setActivityIndex((i) => (i + 1) % count), 900);
    return () => clearInterval(t);
  }, [stageIndex, done]);

  const progressPct = (Math.min(stageIndex, PIPELINE_STAGES.length) / PIPELINE_STAGES.length) * 100;

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <DemoBadge />
          <h2 className="font-display mt-3 text-2xl font-semibold sm:text-3xl">Running pipeline</h2>
          <p className="mt-1 text-inksoft">{jobTitle}</p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="mt-6" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progressPct)} aria-label="Pipeline progress">
        <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accentdeep"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </div>
        <p className="mt-2 text-xs font-medium text-inksoft">
          Stage {Math.min(stageIndex + 1, 5)} of 5{done && " — complete"}
        </p>
      </div>

      {/* Stage list */}
      <ol className="mt-6 space-y-5">
        {PIPELINE_STAGES.map((stage, i) => {
          const isDone = i < stageIndex;
          const isActive = i === stageIndex && !done;
          const activity = stage.activity[activityIndex % stage.activity.length];
          return (
            <li key={stage.id} className="flex gap-4">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center" aria-hidden>
                {isDone ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500">
                    <svg viewBox="0 0 16 16" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3.5 8.5l3.5 3.5 5.5-7" />
                    </svg>
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
                  <h3 className={`text-[15px] ${isActive ? "font-semibold" : "font-medium"}`}>{stage.title}</h3>
                  {isActive && (
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={activity}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                        className="text-[13px] text-accentdeep"
                      >
                        {activity}
                      </motion.p>
                    </AnimatePresence>
                  )}
                  {!isDone && !isActive && (
                    <span className="text-[13px] font-medium text-inksoft">Queued</span>
                  )}
                  {isDone && <span className="text-[13px] font-medium text-emerald-700">Done</span>}
                </div>
                <p className="mt-0.5 text-sm text-inksoft">{stage.description}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-8 border-t border-ink/8 pt-4 text-[13px] text-inksoft">
        Running live via EventSource on http://127.0.0.1:8000
      </p>
    </Card>
  );
}
