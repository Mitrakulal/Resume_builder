import { motion } from "framer-motion";

/** Animated circular score indicator. Flat accent stroke, no gradients. */
export function ScoreRing({ score, size = 148 }: { score: number; size?: number }) {
  const stroke = 12;
  const r = size / 2 - stroke / 2;
  const circumference = 2 * Math.PI * r;
  const targetOffset = circumference * (1 - score / 100);

  return (
    <div
      className="relative inline-flex"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Overall match score ${score} percent`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-ink/10" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#ff6a2b"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: targetOffset }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-semibold">{score}%</span>
        <span className="mt-1 text-[11px] font-semibold tracking-[0.18em] text-inksoft uppercase">match</span>
      </div>
    </div>
  );
}
