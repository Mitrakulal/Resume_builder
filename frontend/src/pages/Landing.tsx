import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar, Footer } from "../components/layout.tsx";
import { ButtonLink, Chip, SectionHeading, Reveal, DemoBadge, Card } from "../components/ui.tsx";
import { PIPELINE_STAGES } from "../lib/pipeline.ts";
import { testimonials, faqs, pricingTiers, demoNotice } from "../data/demo.ts";

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
        <Chip className="shadow-card !px-4 !py-2 font-semibold">92% match score</Chip>
      </div>
      <div className="animate-float-slow absolute top-1/2 -right-3 z-10 sm:-right-8">
        <Chip className="bg-white shadow-card !px-4 !py-2 font-semibold text-ink">Proofread: 4 fixes</Chip>
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
        aria-label="Preview of the Applywise pipeline running on a Frontend Engineer role at Northwind Labs"
      >
        {/* window chrome */}
        <div className="mb-5 flex items-center gap-3 border-b border-ink/8 pb-4">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <p className="truncate text-sm font-semibold text-inksoft">
            Pipeline run — Frontend Engineer @ Northwind Labs
          </p>
        </div>

        {/* stage rows */}
        <ol className="space-y-2.5">
          {PIPELINE_STAGES.map((stage, i) => {
            const done = i < 3;
            const active = i === 3;
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
                    <SpinnerIcon /> writing…
                  </span>
                )}
                {i === 4 && <span className="text-sm font-medium text-inksoft">queued</span>}
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
              animate={{ width: "68%" }}
              transition={{ duration: 1.4, delay: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-right text-xs font-medium text-inksoft">Stage 4 of 5 running</p>
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
            <Chip>AI Job Application Assistant</Chip>
            <h1 className="font-display mt-6 max-w-xl text-5xl leading-[1.08] font-semibold text-balance sm:text-6xl">
              Turn any job description into a cover letter that gets interviews.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-inksoft">
              Applywise reads the JD, mines your portfolio for proof, matches your strongest skills,
              drafts a tailored cover letter, and proofreads it — all grounded in your real experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/app/new" size="lg">
                Start free
              </ButtonLink>
              <ButtonLink to="/#how-it-works" variant="outline" size="lg">
                See how it works
              </ButtonLink>
            </div>
            <p className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-inksoft">
              <span>✓ Never invents experience</span>
              <span aria-hidden>·</span>
              <span>✓ Demo data only</span>
              <span aria-hidden>·</span>
              <span>✓ Runs in your browser</span>
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
    { value: "92%", label: "average match score" },
    { value: "5", label: "pipeline stages" },
    { value: "3", label: "tone presets" },
    { value: "0", label: "fabricated lines" },
  ];
  return (
    <section aria-label="Key numbers" className="border-y border-ink/10 bg-parchment">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-ink/10 px-5 sm:px-8 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.07} className="px-6 py-8 text-center lg:py-10">
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
          title="Five stages. Zero invented experience."
          sub="Each application flows through a transparent pipeline — you see exactly what happens at every step, and every claim traces back to your portfolio."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3 lg:grid-cols-5">
          {PIPELINE_STAGES.map((stage, i) => (
            <Reveal key={stage.id} delay={i * 0.08} className="h-full">
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

/* -------------------------------- Features -------------------------------- */

const features = [
  {
    title: "Never fabricates",
    copy: "Every sentence is traceable to your portfolio. No invented titles, dates, employers or metrics — ever.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Local-first privacy",
    copy: "JD reading and skill matching run on your machine. Your personal data stays where it belongs — with you.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 018 0v3" />
      </svg>
    ),
  },
  {
    title: "JD from link, PDF or paste",
    copy: "Drop in a job link, upload the PDF, or paste the text. Requirements and keywords are extracted automatically.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <path d="M10 14a5 5 0 007.1 0l3-3a5 5 0 00-7.1-7.1l-1.5 1.5" />
        <path d="M14 10a5 5 0 00-7.1 0l-3 3a5 5 0 007.1 7.1l1.5-1.5" />
      </svg>
    ),
  },
  {
    title: "Skill-match transparency",
    copy: "See every skill scored against the JD, with the portfolio entry it came from. No black-box claims.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <path d="M4 6h16M4 12h16M4 18h10" />
        <path d="M18 16l2 2 3.5-4" />
      </svg>
    ),
  },
  {
    title: "Tone presets",
    copy: "Professional for the banks, Friendly for the scale-ups, Bold for the startups. One click re-drafts the letter.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <path d="M4 8h10M18 8h2M4 16h2M10 16h10" />
        <circle cx="16" cy="8" r="2.2" />
        <circle cx="8" cy="16" r="2.2" />
      </svg>
    ),
  },
  {
    title: "Inline proofreading",
    copy: "Grammar, filler phrases and tone slips are flagged as inline suggestions — accept or ignore each fix.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
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
          title="Built for honest applications"
          sub="Tools that write for you usually guess. Applywise proves — grounding every line in the work you've actually done."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08} className="h-full">
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
    "A tailored cover letter in your chosen tone",
    "A match score with requirement breakdown",
    "Skill-by-skill transparency report",
    "A downloadable .txt of the final draft",
  ];
  return (
    <section className="bg-cream" aria-labelledby="sample-heading">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <SectionHeading
          eyebrow="Sample output"
          title="See what one run produces"
          sub="A preview of the deliverables from a single pipeline run — ready to edit, download and send."
        />
        <Reveal className="mt-14">
          <div className="grid overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-soft lg:grid-cols-2">
            {/* letter excerpt */}
            <div className="border-b border-ink/8 bg-parchment/60 p-7 sm:p-9 lg:border-r lg:border-b-0">
              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-inksoft">Application for Frontend Engineer — Aarav Mehta</p>
                <DemoBadge />
              </div>
              <p className="text-[15px] font-medium">Dear Hiring Manager,</p>
              <p className="mt-4 text-[15px] leading-relaxed text-inksoft">
                I am writing to apply for the Frontend Engineer role at Northwind Labs. With two years of experience
                building responsive React applications, I was excited to see an opening that values clean interfaces
                and thoughtful user experience.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-inksoft">
                At Lumen Labs, I rebuilt the company&apos;s marketing site and internal dashboard using React,
                TypeScript, and Tailwind CSS, improving page load times by 34%.
              </p>
              <p className="mt-4 text-[15px] font-medium">— Aarav Mehta</p>
              <p className="mt-5 text-xs text-inksoft/80">Sample output — full letter continues with 2 more paragraphs and 4 proofreading fixes.</p>
            </div>
            {/* what you get */}
            <div className="p-7 sm:p-9">
              <h3 id="sample-heading" className="font-display text-2xl font-semibold">
                What you get
              </h3>
              <ul className="mt-6 space-y-4">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-[16px]">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage text-ink">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/app"
                className="mt-8 inline-flex items-center gap-2 font-semibold text-accentdeep transition-transform hover:translate-x-1"
              >
                Try the live demo <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------ Testimonials ----------------------------- */

function Testimonials() {
  return (
    <section className="bg-parchment" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <SectionHeading
          eyebrow="Loved by applicants"
          title="Real people, real interviews"
          sub="From first-time applicants to career switchers — here's what changes when your letters are grounded in truth."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08} className="h-full">
              <Card className="flex h-full flex-col p-7">
                <p className="font-display text-4xl text-accent" aria-hidden>
                  &ldquo;
                </p>
                <blockquote className="-mt-2 flex-1 text-[16px] leading-relaxed text-ink">
                  {t.quote}
                </blockquote>
                <div className="mt-6 flex items-center gap-3.5">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-sm font-bold text-cream"
                    aria-hidden
                  >
                    {t.initials}
                  </span>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-inksoft">{t.role}</p>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Pricing teaser ---------------------------- */

function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 bg-cream" aria-labelledby="pricing-heading">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple plans, honest pricing"
          sub="Start free, upgrade when your application volume does. No hidden fees, no lock-in."
        />
        <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
          {pricingTiers.map((tier, i) => {
            const highlighted = tier.highlighted;
            return (
              <Reveal key={tier.name} delay={i * 0.08} className="h-full">
                <Card
                  className={`relative flex h-full flex-col p-8 ${
                    highlighted ? "!border-ink bg-ink text-cream shadow-soft" : ""
                  }`}
                >
                  {highlighted && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1.5 text-xs font-bold tracking-wide text-white uppercase shadow-card">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-lg font-semibold">{tier.name}</h3>
                  <p className="mt-3 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-semibold">{tier.price}</span>
                    {tier.period && (
                      <span className={`text-sm ${highlighted ? "text-cream/60" : "text-inksoft"}`}>{tier.period}</span>
                    )}
                  </p>
                  <ul className="mt-6 flex-1 space-y-3.5">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[15px]">
                        <span
                          className={`mt-0.5 font-bold ${highlighted ? "text-accent" : "text-accentdeep"}`}
                          aria-hidden
                        >
                          ✓
                        </span>
                        <span className={highlighted ? "text-cream/85" : ""}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <ButtonLink
                    to="/app/new"
                    variant={highlighted ? "primary" : "outline"}
                    className={`mt-8 w-full ${highlighted ? "" : "!bg-transparent"}`}
                  >
                    {tier.cta}
                  </ButtonLink>
                </Card>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm text-inksoft">{demoNotice}</p>
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
              <Reveal key={faq.q} delay={i * 0.05}>
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
              <Chip className="bg-peach text-ink">92% match score</Chip>
            </div>
            <div className="relative">
              <h2 id="cta-heading" className="font-display mx-auto max-w-2xl text-4xl leading-tight font-semibold text-balance sm:text-5xl">
                Your next application writes itself.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-cream/70">
                Paste a job description and get a tailored, proofread cover letter in minutes —
                grounded in your real experience, never invented.
              </p>
              <div className="mt-9 flex flex-col items-center gap-4">
                <ButtonLink to="/app/new" size="lg">
                  Start free — no signup
                </ButtonLink>
                <p className="text-sm text-cream/50">Demo mode · fictional data</p>
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
        <Features />
        <SampleOutput />
        <Testimonials />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
