import { motion } from "framer-motion";
import { Chip } from "./ui.tsx";

/** One skill row with an animated relevance bar and the JD requirement it addresses. */
export function MatchBar({
  skill,
  score,
  requirement,
  source,
}: {
  skill: string;
  score: number;
  requirement: string;
  source: string;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{skill}</span>
          <Chip className="!px-2.5 !py-0.5 !text-xs">{source}</Chip>
        </div>
        <span className="font-display text-xl font-semibold text-accent">{score}%</span>
      </div>
      <div
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-ink/8"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        aria-label={`${skill} match score`}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accentdeep"
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
      <p className="mt-1.5 text-[13px] text-inksoft">Addresses: {requirement}</p>
    </div>
  );
}
