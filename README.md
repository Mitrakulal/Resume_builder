# AI Resume Agent & Tailoring Engine

Takes a job description (JD) plus a single `master_profile.json` source of truth and produces a tailored, ATS-oriented PDF resume.

Built with **LangGraph** orchestration, **LangChain** structured outputs, **FastAPI + SSE** streaming, a **React + Vite** frontend, **Jinja2 + LaTeX**, and **MiKTeX/pdflatex**.

> **Project status: working prototype, not production-ready.**
>
> The backend pipeline runs end-to-end and produces a PDF. The frontend is only **partially** connected: profile editing, starting a tailoring job, live pipeline progress, and PDF preview/download use the real API; the dashboard, application history, match breakdown, and cover-letter screens still use demo data.
>
> The "never invent experience" guarantee is currently enforced by **prompt instructions only**. There is no automated verifier or provenance check yet. See [`Docs/project_audit_report.md`](Docs/project_audit_report.md) for the full audit, known issues, and roadmap.

---

## What it does

1. **Read the JD** — an LLM extracts a structured `JDRequirements` object: title, company, must-have/nice-to-have skills, responsibilities, and keywords.
2. **Load the profile** — `master_profile.json` is parsed and validated into a `CandidateProfile` Pydantic model.
3. **Match** — a deterministic Python node computes skill overlap, gaps, and a relevance score.
4. **Generate content** — an LLM rewrites 2–4 tailored bullets per selected experience/project, categorizes skills, and writes a targeted summary.
5. **Render** — Jinja2 fills the LaTeX template after recursively normalizing Unicode and escaping LaTeX special characters.
6. **Compile** — `pdflatex` produces `output/resume.pdf`.

The graph is strictly linear. There are no conditional edges or retry loops; a node failure is raised and surfaced through the job's SSE stream.

---

## Architecture

```text
JD text
  │
  ▼
read_jd ──► load_profile ──► match ──► generate_content ──► render ──► compile
 (LLM)       (Python)        (Python)      (LLM)            (Jinja2)   (pdflatex)
                                                                          │
                                                                          ▼
                                                                 output/resume.pdf
```

**Important:** `match` is exact, case-insensitive string matching today — not semantic matching. `generate_content` receives the full profile plus the match output, so the matching node does not currently constrain what the LLM can select or write. This is the main trust gap documented in the audit.

### Pipeline nodes

| Node | Type | What it actually does |
|---|---|---|
| `read_jd` | LLM, structured output | Extracts `JDRequirements` from the pasted JD. |
| `load_profile` | Deterministic Python | Reads and validates `master_profile.json`. Returns an `error` key on failure, but the graph does not currently stop. |
| `match` | Deterministic Python | Exact string intersection of top-level profile skills against JD skills/keywords. Produces `matched_skills`, `gap_areas`, `matched_experience`, and `relevance_score`. Projects are not considered. |
| `generate_content` | LLM, structured output | Produces `ResumeContent`: summary, experience/project entries with rewritten bullets, categorized skills, education, and certifications. Grounding is prompt-only. |
| `render` | Deterministic Python | Escapes Unicode/LaTeX specials and renders `templates/resume_template.tex.jinja` to `output/resume.tex`. |
| `compile` | Subprocess | Runs `pdflatex` with `-interaction=nonstopmode -halt-on-error` and returns `output/resume.pdf`. |

---

## Tech stack

**Backend**
- LangGraph `StateGraph`
- LangChain `ChatOpenAI` against any OpenAI-compatible endpoint
- Pydantic v2 schemas
- FastAPI + Uvicorn
- Server-Sent Events via `sse-starlette`
- Jinja2 + LaTeX + MiKTeX `pdflatex`
- Optional LangSmith tracing

**Frontend**
- React 19 + TypeScript + Vite 7
- Tailwind CSS v4
- Framer Motion
- React Router 7
- Lucide React

---

## Repository layout

```text
resume-agent/
├── api.py                          # FastAPI app, profile endpoints, tailoring jobs, SSE, PDF serving
├── graph.py                        # LangGraph wiring (6 application nodes, linear)
├── state.py                        # ResumeAgentState TypedDict
├── config.py                       # Unused configuration module (see audit)
├── run.py                          # Placeholder CLI entrypoint; no implementation
├── test.py                         # Legacy duplicate of api.py + commented experiments; NOT a test suite
├── master_profile.json             # Source-of-truth candidate profile
├── nodes/
│   ├── read_jd.py                  # JD extraction (LLM)
│   ├── load_profile.py             # Profile loading/validation
│   ├── match.py                    # Skill matching and scoring
│   ├── generate_content.py         # Tailored resume synthesis (LLM)
│   ├── render.py                   # Unicode/LaTeX escaping + Jinja2 rendering
│   └── compile.py                  # pdflatex subprocess
├── schemas/
│   ├── candidate_profile.py
│   ├── jd_requirements.py
│   ├── matched_items.py
│   └── resume_content.py
├── templates/
│   └── resume_template.tex.jinja
├── output/                         # Generated .tex/.pdf and compile logs (gitignored)
├── frontend/                       # React + Vite app
│   ├── src/
│   │   ├── pages/                  # Landing, Dashboard, NewApplication, MatchResults, LetterEditor, Portfolio, Applications, Settings
│   │   ├── components/             # PipelineRunner, UI primitives, score/match bars, diff view, layout
│   │   ├── store/AppContext.tsx    # profile, applications, tone, backend sync
│   │   ├── data/demo.ts            # demo profile, JDs, match data, cover letters
│   │   └── lib/pipeline.ts         # animated pipeline stage definitions
│   └── package.json
└── Docs/
    ├── resume_agent_spec_v1.md
    ├── industry_grade_resume_agent_blueprint.md
    ├── BUILD_LOG.md
    └── project_audit_report.md     # Full audit, issues, and roadmap
```

---

## Prerequisites

- **Python 3.10+**
- **Node.js 18+ and npm**
- **MiKTeX with `pdflatex`**
  - Windows: auto-detected at `%LOCALAPPDATA%\Programs\MiKTeX\miktex\bin\x64\pdflatex.exe` or found on `PATH`.
  - macOS/Linux: install a TeX distribution and ensure `pdflatex` is on `PATH`.
- An **OpenAI-compatible chat endpoint** and API key (OpenAI, Groq, Ollama, llama.cpp, vLLM, etc.).

---

## Backend setup

```powershell
# From the project root
python -m venv .venv
.\.venv\Scripts\Activate.ps1

python -m pip install --upgrade pip
pip install fastapi "uvicorn[standard]" sse-starlette pydantic email-validator python-dotenv jinja2 langgraph langchain langchain-openai httpx
```

On macOS/Linux, activate with `source .venv/bin/activate`.

> There is no pinned `requirements.txt`, `pyproject.toml`, or lockfile committed yet. The command above is the current runtime set. Adding a reproducible dependency file is a P0 item in the audit report.

### Environment configuration

Create `.env` in the project root. Do **not** commit it.

```ini
# Recommended: any OpenAI-compatible endpoint.
# Setting GEMMA_BASE_URL also forces chat-completions mode.
GEMMA_API_KEY=your_api_key
GEMMA_BASE_URL=https://api.groq.com/openai/v1
GEMMA_MODEL=llama-3.3-70b-versatile
GEMMA_MAX_TOKENS=2048

# Optional tracing
LANGSMITH_TRACING=false
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=
LANGSMITH_PROJECT=resume-agent
```

Current lookup order in the code:

| Setting | Lookup order |
|---|---|
| Model | `MODEL_NAME` → `OPENAI_MODEL` → `GEMMA_MODEL` → node default |
| API key | `OPENAI_API_KEY` → `GEMMA_API_KEY` |
| Base URL | `CLOUD_ENDPOINT` → `OPENAI_BASE_URL` → `GEMMA_BASE_URL` |
| API mode | `GEMMA_BASE_URL` set → chat completions; otherwise → Responses API |

The `GEMMA_*` names are legacy, but they are currently the most reliable way to select an OpenAI-compatible chat-completions endpoint. This configuration wart is tracked in the audit.

### Run the API

```powershell
uvicorn api:app --reload --port 8000
```

- API: `http://127.0.0.1:8000`
- Interactive docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/health`

> Run this on localhost only until authentication, CORS, and the PDF fallback behavior are fixed. Currently any website you visit can reach a locally running instance.

---

## Frontend setup

```powershell
cd frontend
npm install
npm run dev
```

- Dev server: `http://localhost:5173`
- Type-check + production build: `npm run build`

The backend URL is currently hardcoded to `http://127.0.0.1:8000` in several files; there is no `VITE_API_BASE_URL` support yet.

### What is actually wired to the backend

| Route | Status |
|---|---|
| `/` Landing | Marketing/demo content. Copy still describes cover-letter generation. |
| `/app` Dashboard | Uses demo applications; the profile name comes from the real backend. |
| `/app/new` | **Real:** `POST /api/tailor`, then SSE progress via `EventSource`. No error UI if the backend is down. |
| `/app/match/:id` | **Real:** PDF preview/download. **Demo:** JD requirements, skill bars, and match score — custom JDs fall back to the first sample JD. |
| `/app/letter/:id` | Demo only. Cover-letter generation is not implemented by the backend. |
| `/app/portfolio` | **Real:** `GET /api/profile` on load and `POST /api/profile` on save. |
| `/app/applications` | In-memory demo history. Not persisted to the backend. |
| `/app/settings` | Mostly UI-only: API URL, model tier, and preferences are not wired. |

---

## API reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/profile` | `GET` | Returns the current raw `master_profile.json`. |
| `/api/profile` | `POST` | Validates against `CandidateProfile` and overwrites `master_profile.json`. The write is not atomic and there is no backup. |
| `/api/tailor` | `POST` | Starts a job. Body: `{ "jd_text": "..." }`. Returns `{ job_id, status, message }`. |
| `/api/tailor/{job_id}/stream` | `GET` | SSE stream for the job. |
| `/api/tailor/{job_id}/pdf` | `GET` | Returns the compiled PDF. **Warning:** an unknown/corrupt job ID falls back to the last global `output/resume.pdf`. |
| `/api/health` | `GET` | Liveness check; does not verify LLM or LaTeX availability. |

### SSE events

| Event | Payload |
|---|---|
| `start` | `{ job_id, message }` |
| `node_progress` | `{ node, status, details?, pdf_url? }` |
| `completed` | `{ job_id, status, pdf_url, message }` |
| `error` | `{ job_id, error }` |

The `details` payload currently reports zero counts because the API reads `required_skills` and `missing_skills`, while the schemas define `must_have_skills` and `gap_areas`. See audit finding `API-07`.

---

## Output

Each run writes:

```text
output/resume.tex
output/resume.pdf
output/resume.aux
output/resume.log
output/resume.out
```

These files are gitignored. All jobs share the same output paths, so **do not run concurrent tailoring jobs yet** — they will overwrite each other. The current local sample PDF is two pages and contains overfull LaTeX boxes; page-budget and overflow hardening are planned.

---

## Current limitations

These are documented in detail in [`Docs/project_audit_report.md`](Docs/project_audit_report.md).

- **Grounding is prompt-only.** The generation schema allows the LLM to emit company, role, and date fields, and there is no entity/metric verifier or bullet-level provenance.
- **Matching is exact string matching.** Aliases (`Postgres` vs `PostgreSQL`, `JS` vs `JavaScript`) and semantic similarity are not handled; the relevance score is not a reliable fit metric.
- **The match result does not constrain generation.** The full profile is sent to the LLM.
- **Concurrent jobs corrupt shared output.** All runs write to the same `output/resume.tex` and `output/resume.pdf`.
- **Jobs live in memory.** They disappear on restart, have no TTL, and SSE events cannot be replayed.
- **The local API has no authentication and allows all CORS origins.** The profile can be read or overwritten by any web page that can reach the port.
- **Profile writes are not atomic.** A crash during save can truncate the source-of-truth file.
- **The frontend is split between demo data and the real API.** Custom JDs display unrelated demo match data/score.
- **Application history is not persistent.** Refreshing the page loses locally created applications.
- **The sample PDF is two pages with overfull boxes.** There is no one-page budget or ATS text-extraction check.
- **Repository tooling is incomplete.** No `requirements.txt`/`pyproject.toml`, no automated tests, no CI, and `test.py` is a stale duplicate of `api.py`, not a test suite.
- **Docs have drifted.** `Docs/BUILD_LOG.md` still mentions Tectonic and an LLM-based match node; the code uses `pdflatex` and deterministic matching.

---

## Roadmap

**P0 — Trust and data safety**
- Change the generation contract to return source IDs + bullets only; join companies/roles/dates from the profile.
- Add a `verify_groundedness` node with entity and metric locking; reject or regenerate unsupported claims.
- Make profile writes atomic and keep a backup/history.
- Remove the arbitrary-job-ID PDF fallback; restrict CORS to the frontend origin; add a local token.

**P1 — Matching and job execution**
- Add normalization, aliases, taxonomy buckets, and must-have/nice-to-have weighting.
- Include projects and per-entry skills in matching; pass only matched entries to generation.
- Use per-job output directories and a persistent/replayable job store.
- Add LLM/subprocess timeouts and structured-output retry/repair.

**P2 — Frontend completion**
- Add a result endpoint that returns the real JD requirements, match data, resume content, and PDF URL.
- Remove demo fallbacks for real applications; add loading/error states.
- Align the pipeline stages with the actual resume pipeline.
- Persist applications and wire Settings.

**P3 — Output and tooling**
- Enforce a one-page budget and eliminate overfull boxes.
- Add PDF text-extraction/ATS verification.
- Add `requirements.txt` or `pyproject.toml`, `pytest`, `ruff`, frontend linting, and CI.
- Refresh `Docs/BUILD_LOG.md`, add a `LICENSE` file, and remove the legacy `test.py`.

---

## Contributing

- `master_profile.json` is the source of truth. Never introduce facts that are not present there.
- Keep `.env`, `output/`, `node_modules/`, and `dist/` out of git.
- Add tests alongside changes once the test scaffolding exists.
- For non-trivial changes, update this README and the audit report so documentation does not drift again.

---

## License

MIT License. A `LICENSE` file has not been added to the repository yet.

Created by [Mitra Kulal](https://github.com/kulalmitra).
