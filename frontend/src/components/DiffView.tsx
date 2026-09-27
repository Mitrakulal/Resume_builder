import type { ReactNode } from "react";
import type { ProofreadCorrection } from "../data/demo.ts";

const KIND_BADGE: Record<ProofreadCorrection["kind"], string> = {
  grammar: "bg-sky-100 text-sky-800",
  tone: "bg-violet-100 text-violet-800",
  clarity: "bg-amber-100 text-amber-800",
};

/**
 * Renders a single paragraph. When proofread is on, every correction whose
 * `original` appears in the text is swapped for its corrected wording,
 * highlighted with .diff-fix (note as tooltip). The untouched originals are
 * listed in DiffSuggestions below.
 */
export function renderDiffParagraph(
  p: string,
  key: string | number,
  corrections: ProofreadCorrection[],
  proofreadOn: boolean,
): ReactNode {
  if (!proofreadOn) return <p key={key}>{p}</p>;

  const hits = corrections
    .map((correction) => ({ correction, idx: p.indexOf(correction.original) }))
    .filter((h) => h.idx >= 0)
    .sort((a, b) => a.idx - b.idx);

  if (hits.length === 0) return <p key={key}>{p}</p>;

  const segments: ReactNode[] = [];
  let cursor = 0;
  hits.forEach(({ correction, idx }, i) => {
    if (idx < cursor) return; // overlapping hits: keep the first
    segments.push(p.slice(cursor, idx));
    segments.push(
      <span key={`fix-${key}-${i}`} className="diff-fix" title={correction.note}>
        {correction.corrected}
      </span>,
    );
    cursor = idx + correction.original.length;
  });
  segments.push(p.slice(cursor));
  return <p key={key}>{segments}</p>;
}

/** The "Proofreading suggestions (N)" list — originals shown struck through. */
export function DiffSuggestions({
  paragraphs,
  corrections,
  proofreadOn,
}: {
  paragraphs: string[];
  corrections: ProofreadCorrection[];
  proofreadOn: boolean;
}) {
  if (!proofreadOn) return null;
  const shown = corrections.filter((c) => paragraphs.some((p) => p.includes(c.original)));
  if (shown.length === 0) return null;

  return (
    <section aria-label="Proofreading suggestions" className="mt-10 border-t border-ink/10 pt-6">
      <h4 className="text-sm font-semibold tracking-wide text-ink uppercase">
        Proofreading suggestions ({shown.length})
      </h4>
      <ul className="mt-4 space-y-3">
        {shown.map((c, i) => (
          <li
            key={i}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-parchment px-4 py-3 text-[15px]"
          >
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${KIND_BADGE[c.kind]}`}
            >
              {c.kind}
            </span>
            <span className="diff-orig">{c.original}</span>
            <span aria-hidden className="text-inksoft">
              →
            </span>
            <span className="diff-fix">{c.corrected}</span>
            <span className="w-full text-sm text-inksoft sm:w-auto sm:flex-1 sm:text-right">
              {c.note}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Full diff view: proofread paragraphs followed by the suggestions list. */
export default function DiffView({
  paragraphs,
  corrections,
  proofreadOn,
}: {
  paragraphs: string[];
  corrections: ProofreadCorrection[];
  proofreadOn: boolean;
}) {
  return (
    <div>
      <div className="space-y-4 leading-relaxed text-ink">
        {paragraphs.map((p, i) => renderDiffParagraph(p, i, corrections, proofreadOn))}
      </div>
      <DiffSuggestions paragraphs={paragraphs} corrections={corrections} proofreadOn={proofreadOn} />
    </div>
  );
}
