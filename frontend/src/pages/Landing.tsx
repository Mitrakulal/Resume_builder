import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar, Footer } from "../components/layout.tsx";
import { ButtonLink, Chip, SectionHeading, Reveal, SampleBadge, Card } from "../components/ui.tsx";
import { PIPELINE_STAGES } from "../lib/pipeline.ts";
import { faqs } from "../data/marketing.ts";
import { InView } from "@/components/motion-primitives/in-view";
import { TextEffect } from "@/components/motion-primitives/text-effect";

/* ------------------------- Pipeline mockup visual ------------------------ */

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 animate-spin text-accent" aria-hidden role="presentation">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M18 10a8 8 0 00-8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function PipelineMockup() {
  return (
    <div className="relative">
      {/* backdrop texture + blob */}
      <div className="dot-grid absolute -top-8 -right-8 h-48 w-48 opacity-60" aria-hidden />
      <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-peachdeep blur-3xl" aria-hidden />

      {/* floating chips */}
      <div className="animate-float absolute -top-5 -left-4 z-10 sm:-left-8">
        <Chip className="shadow-card !px-4 !py-2 font-semibold">12 matched skills</Chip>
      </div>
      <div className="animate-float-slow absolute top-1/2 -right-3 z-10 sm:-right-8">
        <Chip className="bg-white shadow-card !px-4 !py-2 font-semibold text-ink">PDF compiled</Chip>
      </div>
      <div className="animate-float absolute -bottom-5 left-10 z-10" style={{ animationDelay: "-3s" }}>
        <Chip className="bg-ink !px-4 !py-2 font-semibold text-cream shadow-card">JD parsed ✓</Chip>
      </div>

      {/* app window card */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl border border-ink/8 bg-white p-6 shadow-soft sm:p-7"
        role="img"
        aria-label="Preview of the Applywise pipeline running on an AI/ML Engineer role"
      >
        {/* window chrome */}
        <div className="mb-5 flex items-center gap-3 border-b border-ink/8 pb-4">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <p className="truncate text-sm font-semibold text-inksoft">
            Pipeline run — AI/ML Engineer @ Acme Labs
          </p>
        </div>

        {/* stage rows */}
        <ol className="space-y-2.5">
          {PIPELINE_STAGES.map((stage, i) => {
            const done = i < 2;
            const active = i === 2;
            return (
              <li
                key={stage.id}
                className={`flex items-center gap-3.5 rounded-2xl border px-4 py-3 ${
                  done
                    ? "border-ink/8 bg-cream/60"
                    : active
                      ? "border-accent/30 bg-peach/50"
                      : "border-ink/8 bg-white opacity-45"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    done ? "bg-sage text-ink" : active ? "bg-accent text-white" : "bg-ink/8 text-inksoft"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="flex-1 truncate text-[15px] font-medium text-ink">{stage.title}</span>
                {done && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                    <CheckIcon /> Done
                  </span>
                )}
                {active && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-accentdeep">
                    <SpinnerIcon /> matching…
                  </span>
                )}
                {!done && !active && (
                  <span className="text-sm font-medium text-inksoft">queued</span>
                )}
              </li>
            );
          })}
        </ol>

        {/* progress bar */}
        <div className="mt-5">
          <div className="h-2 overflow-hidden rounded-full bg-ink/8" aria-hidden>
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: "0%" }}
              animate={{ width: "48%" }}
              transition={{ duration: 1.4, delay: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-right text-xs font-medium text-inksoft">Stage 3 of 6 running</p>
        </div>
      </motion.div>
    </div>
  );
}

/* --------------------------------- Hero --------------------------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="dot-grid absolute top-24 right-0 h-64 w-64 opacity-50" aria-hidden />
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pt-28 pb-16 sm:px-8 md:pt-36 lg:grid-cols-2 lg:gap-10 lg:pb-24">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Chip>Resume tailoring, grounded in your profile</Chip>
            <h1 className="font-display mt-6 max-w-xl text-5xl leading-[1.08] font-semibold text-balance sm:text-6xl">
              Turn any job description into a resume that gets interviews.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-inksoft">
              Applywise reads the JD, matches it against your master profile, writes tailored resume
              content, and compiles a real PDF through a six-node LangGraph pipeline.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/app/new" size="lg">
                Start tailoring
              </ButtonLink>
              <ButtonLink to="/#how-it-works" variant="outline" size="lg">
                See how it works
              </ButtonLink>
            </div>
            <p className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-inksoft">
              <span>✓ Built from your master profile</span>
              <span aria-hidden>·</span>
              <span>✓ Real PDF output</span>
              <span aria-hidden>·</span>
              <span>✓ Applications saved locally</span>
            </p>
          </motion.div>
        </div>
        <PipelineMockup />
      </div>
    </section>
  );
}

/* ------------------------------- Stats strip ------------------------------ */

function StatsStrip() {
  const stats = [
    { value: "6", label: "pipeline stages" },
    { value: "1", label: "master profile" },
    { value: "PDF", label: "final output" },
    { value: "Local", label: "FastAPI backend" },
  ];
  return (
    <section aria-label="Key numbers" className="border-y border-ink/10 bg-parchment">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-ink/10 px-5 sm:px-8 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.07} from={i % 2 === 0 ? "left" : "right"} className="px-6 py-8 text-center lg:py-10">
            <p className="font-display text-4xl font-semibold text-ink lg:text-5xl">{s.value}</p>
            <p className="mt-2 text-sm font-medium text-inksoft">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ How it works ----------------------------- */

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-cream" aria-labelledby="how-heading">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <SectionHeading
          eyebrow="The pipeline"
          title="Six stages. One source of truth."
          sub="Each application runs through the real LangGraph graph: read the JD, load your profile, match skills, generate content, render LaTeX, compile the PDF. The progress view is streamed from FastAPI."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PIPELINE_STAGES.map((stage, i) => (
            <Reveal key={stage.id} delay={i * 0.07} from={i % 2 === 0 ? "left" : "right"} className="h-full">
              <Card className="flex h-full flex-col p-6">
                <span className="font-display text-5xl font-semibold text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-[17px] leading-snug font-semibold">{stage.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-inksoft">{stage.description}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function InViewInteractiveShowcase() {
  return (
    <section className="relative border-y border-ink/8 bg-gradient-to-b from-cream via-peach/15 to-cream py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="text-center">
          <Chip className="bg-peach text-ink font-semibold">Stage-by-Stage Agent</Chip>
          <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-ink sm:text-5xl">
            Watch the Agent Work as You Scroll
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-inksoft sm:text-lg">
            Every step triggers organically as you scroll down the page, analyzing requirements, matching evidence, and compiling LaTeX.
          </p>
        </div>

        {/* Vertical stream directly tied to window/page scroll */}
        <div className="relative mt-20 space-y-28">
          {/* Subtle center vertical guide line */}
          <div className="absolute left-1/2 top-4 bottom-4 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-ink/15 to-transparent hidden md:block" />

          {/* Step 01: Blur & Rise */}
          <div className="relative flex justify-center">
            <InView
              variants={{
                hidden: {
                  opacity: 0,
                  y: 45,
                  scale: 0.94,
                  filter: "blur(8px)",
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: "blur(0px)",
                },
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              viewOptions={{ margin: "0px 0px -100px 0px" }}
              className="w-full max-w-xl"
            >
              <div className="relative rounded-3xl border border-ink/10 bg-white p-7 shadow-soft hover:shadow-card transition-shadow">
                <div className="flex items-center justify-between border-b border-ink/8 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600">
                      01
                    </span>
                    <span className="text-sm font-semibold text-ink">JD Reader Node</span>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                    read_jd
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-ink">Requirement Extraction</h3>
                <p className="mt-2 text-sm leading-relaxed text-inksoft">
                  The node extracts the job title, company, must-have and nice-to-have skills, responsibilities and keywords from the text you paste.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md bg-cream px-2 py-1 text-ink font-mono font-medium">PyTorch</span>
                  <span className="rounded-md bg-cream px-2 py-1 text-ink font-mono font-medium">RAG</span>
                  <span className="rounded-md bg-cream px-2 py-1 text-ink font-mono font-medium">Quantization</span>
                </div>
              </div>
            </InView>
          </div>

          {/* Step 02: Slide In From Right */}
          <div className="relative flex justify-center">
            <InView
              variants={{
                hidden: {
                  opacity: 0,
                  x: 90,
                },
                visible: {
                  opacity: 1,
                  x: 0,
                },
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              viewOptions={{ margin: "0px 0px -100px 0px" }}
              className="w-full max-w-xl"
            >
              <div className="relative rounded-3xl border border-accent/20 bg-accent/5 p-7 shadow-soft hover:shadow-card transition-shadow">
                <div className="flex items-center justify-between border-b border-accent/15 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                      02
                    </span>
                    <span className="text-sm font-semibold text-ink">Skill Match Node</span>
                  </div>
                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accentdeep">
                    Transparent overlap
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-ink">Matched Skills, Honest Gaps</h3>
                <p className="mt-2 text-sm leading-relaxed text-inksoft">
                  Skills are compared against the parsed requirements. The output separates what matched from what is missing, so the gap list stays visible instead of being invented away.
                </p>
                <div className="mt-4 rounded-xl bg-white/80 p-3 border border-ink/8 text-xs text-inksoft">
                  ✓ Current matcher: deterministic skill comparison. Semantic matching is on the roadmap.
                </div>
              </div>
            </InView>
          </div>

          {/* Step 03: Scale & Perspective Zoom */}
          <div className="relative flex justify-center">
            <InView
              variants={{
                hidden: {
                  opacity: 0,
                  scale: 0.85,
                  y: 40,
                },
                visible: {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                },
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              viewOptions={{ margin: "0px 0px -100px 0px" }}
              className="w-full max-w-xl"
            >
              <div className="relative rounded-3xl border border-ink bg-ink p-7 text-cream shadow-2xl">
                <div className="flex items-center justify-between border-b border-cream/15 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cream text-xs font-bold text-ink">
                      03
                    </span>
                    <span className="text-sm font-semibold text-cream">LaTeX Engine</span>
                  </div>
                  <span className="rounded-full bg-cream/15 px-2.5 py-0.5 text-xs font-medium text-cream">
                    pdflatex compiled
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-white">A real PDF, not a mockup</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">
                  The render node fills a LaTeX template; the compile node runs pdflatex and returns a job-specific PDF from the backend.
                </p>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-white/10 px-4 py-2.5 text-xs">
                  <span>output/resume.pdf</span>
                  <span className="text-emerald-400 font-semibold">Ready for download</span>
                </div>
              </div>
            </InView>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Features -------------------------------- */

const features = [
  {
    title: "Built from your profile",
    copy: "The generator receives your master profile: roles, projects, skills and education. It does not start from a blank page or a generic template.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Runs on your machine",
    copy: "FastAPI, LangGraph and pdflatex run locally. Your profile lives in master_profile.json; LLM calls go to the provider you configure.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 018 0v3" />
      </svg>
    ),
  },
  {
    title: "Paste any job description",
    copy: "Drop the JD text into the form. The reader node extracts the title, skills, responsibilities and keywords before matching.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <path d="M10 14a5 5 0 007.1 0l3-3a5 5 0 00-7.1-7.1l-1.5 1.5" />
        <path d="M14 10a5 5 0 00-7.1 0l-3 3a5 5 0 007.1 7.1l1.5-1.5" />
      </svg>
    ),
  },
  {
    title: "Transparent matching",
    copy: "See the skills that matched and the gaps that did not. The current matcher is deterministic; no invented per-skill scores.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <path d="M4 6h16M4 12h16M4 18h10" />
        <path d="M18 16l2 2 3.5-4" />
      </svg>
    ),
  },
  {
    title: "One-click PDF",
    copy: "The render node fills a LaTeX resume template and the compile node runs pdflatex. The result is a downloadable PDF, not a text mockup.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h6" />
      </svg>
    ),
  },
  {
    title: "Application history",
    copy: "Every run is saved in this browser with its status, captured match counts and PDF link, so you can come back without rerunning.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <path d="M12 8v4l3 2" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
];

function Features() {
  return (
    <section id="features" className="scroll-mt-24 bg-parchment" aria-labelledby="features-heading">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <SectionHeading
          eyebrow="Why Applywise"
          title="Built for real applications"
          sub="A small, inspectable pipeline instead of a black box: every stage has a job, and the output is a PDF you can check before sending."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.07} from={i % 3 === 0 ? "left" : i % 3 === 1 ? "bottom" : "right"} className="h-full">
              <Card className="h-full p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white shadow-[0_10px_25px_-8px_rgb(255_106_43/0.7)]">
                  {f.icon}
                </span>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-inksoft">{f.copy}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Sample output preview ------------------------ */

function SampleOutput() {
  const bullets = [
    "A tailored resume PDF compiled from LaTeX",
    "Parsed job title, skills and responsibilities",
    "Matched skills and gap areas when available",
    "Application history saved in this browser",
  ];
  return (
    <section className="bg-cream" aria-labelledby="sample-heading">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <SectionHeading
          eyebrow="Sample output"
          title="See what one run produces"
          sub="A preview of the deliverables from a single pipeline run. Your own run uses your master profile."
        />
        <div className="mt-14 grid overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-soft lg:grid-cols-2">
          <Reveal from="left">
            <div className="border-b border-ink/8 bg-parchment/60 p-7 sm:p-9 lg:border-r lg:border-b-0">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-inksoft">
                  Tailored resume — AI/ML Engineer, Aarav Mehta
                </p>
                <SampleBadge />
              </div>
              <p className="font-display text-lg font-semibold">Aarav Mehta</p>
              <p className="text-xs text-inksoft">
                Bengaluru, India · aarav.mehta@example.com · github.com/aaravmehta
              </p>
              <p className="mt-5 text-[15px] font-semibold">Summary</p>
              <p className="mt-1 text-[15px] leading-relaxed text-inksoft">
                Full-stack developer with production experience in React and RAG systems,
                comfortable owning features from interface to deployment.
              </p>
              <p className="mt-5 text-[15px] font-semibold">Experience</p>
              <p className="mt-1 text-sm font-medium">
                Frontend Engineering Intern <span className="text-accentdeep">@ Lumen Labs</span>
              </p>
              <ul className="mt-1.5 space-y-1.5 text-[15px] leading-relaxed text-inksoft">
                <li>• Rebuilt the marketing site and internal dashboard in React and TypeScript.</li>
                <li>• Shipped a RAG support chat handling 2,000+ conversations a month.</li>
              </ul>
              <p className="mt-5 text-xs text-inksoft/80">
                Illustrative excerpt. The real pipeline pulls from your profile and compiles a PDF.
              </p>
            </div>
          </Reveal>
          <Reveal from="right">
            <div className="p-7 sm:p-9">
              <h3 id="sample-heading" className="font-display text-2xl font-semibold">
                What you get
              </h3>
              <ul className="mt-6 space-y-4">
                {bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-[16px]">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage text-ink">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/app/new"
                className="mt-8 inline-flex items-center gap-2 font-semibold text-accentdeep transition-transform hover:translate-x-1"
              >
                Open the workspace <span aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Pricing teaser ---------------------------- */

function Pricing() {
  const included = [
    "Profile editor backed by master_profile.json",
    "Six-node LangGraph pipeline with live progress",
    "Tailored resume PDF compiled with pdflatex",
    "Application history saved in this browser",
  ];

  return (
    <section id="pricing" className="scroll-mt-24 bg-cream" aria-labelledby="pricing-heading">
      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
        <SectionHeading
          eyebrow="Access"
          title="Free while it's being built"
          sub="No account, no subscription. This is a locally run prototype, and the backend is the part still being learned and hardened."
        />
        <Reveal className="mt-12">
          <Card className="p-8 sm:p-10">
            <ul className="grid gap-4 sm:grid-cols-2">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px]">
                  <span className="mt-0.5 font-bold text-accentdeep" aria-hidden>
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <ButtonLink to="/app/new" className="mt-8 w-full sm:w-auto">
              Open the workspace
            </ButtonLink>
            <p className="mt-4 text-sm text-inksoft">
              You run the FastAPI backend and frontend locally. No data is sent to an Applywise
              server because there isn't one.
            </p>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------- FAQ ---------------------------------- */

function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-24 bg-parchment" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, answered"
          sub="Everything you might want to know before your first run."
        />
        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => {
            const open = openIndex === i;
            return (
              <Reveal key={faq.q} delay={i * 0.04} from={i % 2 === 0 ? "left" : "right"}>
                <div className={`overflow-hidden rounded-2xl border transition-colors ${open ? "border-ink/15 bg-white shadow-card" : "border-ink/8 bg-white/70"}`}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : i)}
                    aria-expanded={open}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-button-${i}`}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-[16px] font-semibold">{faq.q}</span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl font-medium transition-all duration-300 ${
                        open ? "rotate-45 bg-accent text-white" : "bg-ink/5 text-ink"
                      }`}
                      aria-hidden
                    >
                      +
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={`faq-panel-${i}`}
                        role="region"
                        aria-labelledby={`faq-button-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-6 leading-relaxed text-inksoft">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Final CTA ------------------------------- */

function FinalCta() {
  return (
    <section className="bg-cream" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-ink px-8 py-16 text-center text-cream sm:px-12 lg:py-24">
            <div className="dot-grid absolute top-0 left-0 h-56 w-56 opacity-20" aria-hidden />
            <div className="absolute -right-16 -bottom-16 h-72 w-72 rounded-full bg-peachdeep blur-3xl" aria-hidden />
            <div className="animate-float-slow absolute top-10 right-10 hidden sm:block" aria-hidden>
              <Chip className="bg-peach text-ink">6-node pipeline</Chip>
            </div>
            <div className="relative">
              <h2 id="cta-heading" className="font-display mx-auto max-w-2xl text-4xl leading-tight font-semibold text-balance sm:text-5xl">
                Start with the experience you actually have.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-cream/70">
                Paste a job description and generate a tailored resume PDF from your master profile,
                with the matched skills and gaps left visible.
              </p>
              <div className="mt-9 flex flex-col items-center gap-4">
                <ButtonLink to="/app/new" size="lg">
                  Start tailoring
                </ButtonLink>
                <p className="text-sm text-cream/50">Local prototype · no signup</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------- Landing -------------------------------- */

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream text-ink antialiased">
      <Navbar />
      <main>
        <Hero />
        <StatsStrip />
        <HowItWorks />
        <InViewInteractiveShowcase />
        <Features />
        <SampleOutput />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
