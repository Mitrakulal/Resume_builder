# Applywise — Resume Tailoring Frontend

React frontend for the local **resume-agent** pipeline. Paste a job description, run the real six-node LangGraph workflow, watch progress over SSE, and open the compiled PDF.

This is no longer demo mode: the app calls the FastAPI backend for the profile, starts real jobs, subscribes to real node events, and stores application history in the browser.

## Tech stack

- Vite 7 + React 19 + TypeScript (strict)
- Tailwind CSS v4
- React Router v7
- Framer Motion
- Lucide icons

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run preview
```

The backend should be running at `http://127.0.0.1:8000` by default. Override it with `VITE_API_BASE_URL` (see `.env.example`) or from `/app/settings` (persisted in `localStorage`).

## Backend endpoints used

| Endpoint | Purpose |
|---|---|
| `GET /api/profile` | Load `master_profile.json` |
| `POST /api/profile` | Validate and save the profile |
| `POST /api/tailor` | Start a job with `{ jd_text }` |
| `GET /api/tailor/{job_id}/stream` | SSE node progress |
| `GET /api/tailor/{job_id}/pdf` | Download the compiled PDF |
| `GET /api/tailor/{job_id}/result` | **Planned backend endpoint.** The frontend client already calls it and renders `jd_requirements`, `matched_items` and `resume_content` when it exists. A 404 falls back to the locally stored JD and captured progress counts. |

## Pipeline stages

Node ids match `graph.py`:

1. `read_jd` — extract title, skills, responsibilities, keywords
2. `load_profile` — load the candidate profile
3. `match` — deterministic skill match + gaps
4. `generate_content` — LLM resume content
5. `render` — fill the LaTeX template
6. `compile` — run `pdflatex`

`src/lib/pipeline.ts` is the single source for labels and ordering. `PipelineRunner` maps SSE `node_progress` events onto those stages; there are no client-side timers or fake progress.

## Routes

| Route | Page |
|---|---|
| `/` | Landing page |
| `/app` | Dashboard with real saved applications |
| `/app/new` | Start a real tailoring job |
| `/app/match/:id` | Result page: real PDF, live counts, and full result data when the endpoint is available |
| `/app/portfolio` | Edit the master profile |
| `/app/applications` | Saved application history |
| `/app/settings` | Backend URL, profile save, storage notes |

The old demo cover-letter route and its sample data were removed.

## Persistence

- **Profile:** `master_profile.json` through the backend.
- **Applications:** `localStorage` key `applywise.applications.v2` (status, job id, submitted JD, captured counts, PDF URL, completed nodes).
- **API base:** `localStorage` key `applywise.apiBase.v1`.
- **Backend jobs:** in-memory in FastAPI; lost on restart.

## Structure

```
src/
  lib/api.ts          # centralized API client, base URL, errors
  lib/types.ts        # profile, application, result and backend schema types
  lib/pipeline.ts     # six-node pipeline definition + event types
  store/AppContext.tsx# profile loading, application persistence
  components/
    PipelineRunner.tsx# real SSE subscription and stage UI
    ScoreRing.tsx
  pages/              # Landing, Dashboard, NewApplication, MatchResults,
                      # Portfolio, Applications, Settings, NotFound
  data/marketing.ts   # landing-page FAQ copy
```

## Known limitations

- The backend does not expose `/result` yet, so detailed JD/match/resume sections only render once that endpoint is added.
- The backend currently streams limited `details` fields and uses field names that do not match the schemas, so counts can be missing or zero.
- Backend jobs and SSE queues are in-memory and single-consumer; reloading mid-run can miss events.
- The PDF endpoint currently falls back to `output/resume.pdf` for unknown jobs. Removing that fallback is a backend fix.
- No automated tests or CI are configured yet.
