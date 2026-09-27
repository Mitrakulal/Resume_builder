import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  DemoBadge,
  EmptyState,
  PageHeader,
} from "../components/ui.tsx";
import { renderDiffParagraph, DiffSuggestions } from "../components/DiffView.tsx";
import { useApp } from "../store/AppContext.tsx";
import { getJD, letterBodies, TONES } from "../data/demo.ts";
import type { Tone } from "../data/demo.ts";
import { useTypewriter } from "../hooks/useTypewriter.ts";

export default function LetterEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getApplication, updateApplication } = useApp();
  const app = getApplication(id ?? "") ?? null;

  const [tone, setToneLocal] = useState<Tone>(app?.tone ?? "Professional");
  const [edits, setEdits] = useState<string[] | null>(null);
  const [subjectEdit, setSubjectEdit] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [proofreadOn, setProofreadOn] = useState(true);
  const [regen, setRegen] = useState(false);
  const [regenMsg, setRegenMsg] = useState("");
  const regenTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { output: regenTyped } = useTypewriter(regenMsg, 18, 120);

  if (!app) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <EmptyState
          title="No application selected"
          copy="Pick an application to open its cover letter editor."
        />
      </div>
    );
  }

  const jd = getJD(app.jdId);
  const letter = (letterBodies[jd.id] ?? letterBodies["jd-frontend"])[tone];
  const paragraphs = edits ?? letter.paragraphs;
  const subject = subjectEdit ?? letter.subject;

  const downloadTxt = () => {
    const text = [subject, "", letter.greeting, "", ...paragraphs.flatMap((p) => [p, ""]), letter.signoff]
      .join("\n")
      .trim();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${app.company}-${app.role}-cover-letter.txt`.replace(/\s+/g, "-");
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const startEditing = () => {
    setDraftSubject(subject);
    setDraftBody(paragraphs.join("\n\n"));
    setEditing(true);
  };

  const saveEdits = () => {
    setSubjectEdit(draftSubject.trim() || letter.subject);
    const split = draftBody
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    setEdits(split.length > 0 ? split : letter.paragraphs);
    setEditing(false);
  };

  const regenerate = () => {
    if (regenTimeout.current) clearTimeout(regenTimeout.current);
    setRegen(true);
    setRegenMsg("");
    regenTimeout.current = setTimeout(() => {
      setRegen(false);
      setEdits(null);
      setSubjectEdit(null);
      setRegenMsg("Regenerated (simulated) — a fresh draft built from your portfolio entries.");
      regenTimeout.current = setTimeout(() => setRegenMsg(""), 5000);
    }, 1200);
  };

  const chooseTone = (t: Tone) => {
    setToneLocal(t);
    setEdits(null);
    setSubjectEdit(null);
    updateApplication(app.id, { tone: t });
  };

  const markReady = () => {
    updateApplication(app.id, { status: "ready", tone });
    navigate("/app/applications");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Cover letter"
        sub={`${app.role} @ ${app.company} · ${jd.title}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={downloadTxt}>
              Download .txt
            </Button>
            <Button size="sm" onClick={markReady}>
              Mark ready →
            </Button>
          </>
        }
      />

      {/* Controls */}
      <Card className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-4 p-5">
        <div className="flex items-center gap-2" role="group" aria-label="Letter tone">
          {TONES.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tone === t}
              onClick={() => chooseTone(t)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                tone === t ? "bg-ink text-cream" : "bg-ink/5 text-ink hover:bg-ink/10"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={proofreadOn}
            aria-label="Proofreading highlights"
            onClick={() => setProofreadOn((v) => !v)}
            className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors ${
              proofreadOn ? "bg-accent" : "bg-ink/15"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                proofreadOn ? "translate-x-5" : ""
              }`}
            />
          </button>
          <span className="text-sm font-medium text-ink">Proofread</span>
        </div>

        <Button variant="ghost" size="sm" onClick={regenerate} disabled={regen}>
          {regen ? "Regenerating…" : "Regenerate"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => (editing ? saveEdits() : startEditing())}
        >
          {editing ? "Save edits" : "Edit letter"}
        </Button>

        <AnimatePresence>
          {regenMsg && (
            <motion.span
              key="regen-note"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-inksoft"
              aria-live="polite"
            >
              {regenTyped}
              <span aria-hidden className="animate-pulse">
                ▍
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </Card>

      {/* Letter */}
      <Card className="mx-auto max-w-3xl p-8 sm:p-12">
        {regen ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="h-10 w-10 animate-spin rounded-full border-4 border-accent/20 border-t-accent"
              aria-hidden
            />
            <p className="mt-4 font-medium text-inksoft">Regenerating…</p>
          </div>
        ) : editing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="letter-subject" className="mb-1.5 block text-sm font-semibold">
                Subject
              </label>
              <input
                id="letter-subject"
                type="text"
                value={draftSubject}
                onChange={(e) => setDraftSubject(e.target.value)}
                className="w-full rounded-2xl border border-ink/15 bg-cream px-4 py-2.5 font-medium outline-none focus:border-accent"
              />
            </div>
            <div>
              <label htmlFor="letter-body" className="mb-1.5 block text-sm font-semibold">
                Body <span className="font-normal text-inksoft">(blank lines separate paragraphs)</span>
              </label>
              <textarea
                id="letter-body"
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
                rows={18}
                className="w-full rounded-2xl border border-ink/15 bg-cream px-4 py-3 leading-relaxed outline-none focus:border-accent"
              />
            </div>
          </div>
        ) : (
          <article>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="font-semibold text-ink">{subject}</p>
              <p className="mt-4 leading-relaxed">{letter.greeting}</p>
            </motion.div>
            <div className="mt-4 space-y-4 leading-relaxed">
              {paragraphs.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.08 + i * 0.06 }}
                >
                  {renderDiffParagraph(p, `p-${i}`, letter.corrections, proofreadOn)}
                </motion.div>
              ))}
            </div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 + paragraphs.length * 0.06 }}
              className="mt-4 leading-relaxed whitespace-pre-line"
            >
              {letter.signoff}
            </motion.p>
            <DiffSuggestions
              paragraphs={paragraphs}
              corrections={letter.corrections}
              proofreadOn={proofreadOn}
            />
          </article>
        )}
      </Card>

      <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center gap-3">
        <DemoBadge />
        <p className="text-sm text-inksoft">
          Every line traces back to your portfolio entries — nothing is invented.
        </p>
      </div>
    </div>
  );
}
