# Applywise — AI Job Application Assistant (Frontend)

A complete, multi-page frontend for the **AI Job Application Assistant**: paste a job description, run it through a 5-stage pipeline (read JD → search portfolio → match skills → generate cover letter → proofread), and get a tailored, proofread cover letter grounded in your real experience.

> **Demo mode:** this is frontend-only. The pipeline is simulated client-side with fictional sample data. No backend calls are made. Every screen carries a "Demo mode" badge.

## Tech stack

- **Vite 7** + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** (theme tokens in `src/index.css` via `@theme`)
- **React Router v7** (multi-page routing)
- **Framer Motion** (page transitions, scroll reveals, pipeline animation)

## Run it

```bash
npm install
npm run dev      # → http://localhost:5173
npm run build    # type-check + production build → dist/
npm run preview  # preview the production build
```

Requires Node 18+ and npm.

## Pages / routes

| Route | Page |
|---|---|
| `/` | Landing page — nav, hero with animated product mockup, stats, how-it-works (5 stages), features, sample output, testimonials, pricing teaser, FAQ, CTA, footer |
| `/app` | Dashboard — greeting, stat cards, latest pipeline status, quick actions, recent activity |
| `/app/new` | New application — JD input (paste text / upload PDF / from link), pick a sample JD, set target role, then **Run pipeline** with an animated 5-stage progress view |
| `/app/match/:id` | Match results — extracted JD requirements (must-have / nice-to-have chips), skill relevance bars, strongest portfolio proof |
| `/app/letter/:id` | Cover letter editor — tone presets (Professional / Friendly / Bold), editable letter, simulated regenerate, proofread toggle with inline grammar/tone diffs, download `.txt` |
| `/app/portfolio` | Portfolio manager — edit contact, experience, projects, skills (client-side state) |
| `/app/applications` | Applications history — status pills, match scores, per-row actions |
| `/app/settings` | Settings — profile, preferences, backend/API config placeholders (UI only) |

## Project structure

```
src/
├── main.tsx              # entry: BrowserRouter + AppProvider
├── App.tsx               # route table + scroll-to-top + page transitions
├── index.css             # Tailwind v4 theme (cream/peach/ink/accent tokens), fonts, diff styles
├── components/
│   ├── ui.tsx            # Button, Card, Chip, SectionHeading, Reveal, PageHeader, DemoBadge, EmptyState
│   ├── layout.tsx        # Logo, Navbar, Footer, AppShell (sidebar layout for /app)
│   ├── PipelineRunner.tsx# animated 5-stage pipeline simulation
│   ├── ScoreRing.tsx     # animated match-score ring
│   ├── MatchBar.tsx      # animated skill relevance bar
│   └── DiffView.tsx      # proofread inline diffs + suggestion list
├── pages/                # one file per route (see table above)
├── data/
│   └── demo.ts           # ★ all demo content: candidate profile, 3 sample JDs,
│                         #   per-JD match data, 9 cover letters (3 JDs × 3 tones)
│                         #   with proofread corrections, applications, testimonials, FAQs
├── lib/
│   └── pipeline.ts       # 5-stage pipeline definition + demo timings
├── hooks/
│   └── useTypewriter.ts  # typewriter effect hook
└── store/
    └── AppContext.tsx    # in-memory app state: profile, applications, tone
```

## Where the real backend plugs in

The UI is structured so each simulated step maps 1:1 to a backend call:

| Frontend (demo) | Production equivalent |
|---|---|
| `PipelineRunner` stage timers (`src/lib/pipeline.ts`) | `POST /v1/pipeline/run` — LangGraph graph streaming stage events over SSE/WebSocket |
| `matchData` in `src/data/demo.ts` | `Read JD` + `Load Profile` + `Match` nodes → `jd_requirements`, `matched_items` |
| `letterBodies` in `src/data/demo.ts` | `Generate Content` node (cloud model) → `resume_content` / letter draft |
| `corrections` in `src/data/demo.ts` | Proofread node → structured grammar/tone suggestions |
| `AppContext` in-memory state | `GET/POST /v1/applications`, `GET/PATCH /v1/portfolio` |
| Settings → API base URL field | Point the fetch layer at the LangGraph server (default `http://localhost:8000`) |

To go live: add a small `src/lib/api.ts` fetch client, replace the `PipelineRunner` timers with an event-source subscription, and swap the `demo.ts` lookups for API responses. Component props already mirror the backend schemas (`jd_requirements`, `matched_items`, `resume_content`).

## Design notes

- Warm cream/peach SaaS aesthetic (`#faf6f0` base, `#ff6a2b` accent), Fraunces display serif + Inter body.
- Fully responsive (mobile nav, stacking grids) and accessible (semantic landmarks, labeled inputs, focus-visible rings, `aria-pressed`/`aria-checked` on toggles, `prefers-reduced-motion`-friendly Framer Motion defaults).
- The trust principle is a first-class UI element: "never invents experience" appears in the hero, pipeline, letter footer, and FAQ.
