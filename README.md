# Resume Agent

An AI-powered resume tailoring pipeline. Paste in a job description (JD) and get back a tailored, compiled PDF resume — grounded strictly in your real experience from a single `master_profile.json` source of truth. No invented employers, titles, dates, or skills.

Built with **LangGraph** orchestration, **LangChain** structured output, **Jinja2 + LaTeX** rendering, and **MiKTeX/pdflatex** compilation.

## How it works

Linear LangGraph pipeline — every node runs exactly once per invocation:

```
JD text + profile path
        |
        v
  read_jd --> load_profile --> match --> generate_content --> render --> compile --> resume.pdf
```

| Node | Type | What it does |
|------|------|--------------|
| `read_jd` | LLM (structured output) | Extracts `JDRequirements`: job title, company, must-have / nice-to-have skills, responsibilities, keywords |
| `load_profile` | Deterministic Python | Reads `master_profile.json`, validates it against `CandidateProfile` (Pydantic). Returns clear errors on missing file / bad JSON / schema mismatch |
| `match` | Deterministic Python | Case-insensitive skill intersection: `matched_skills`, `gap_areas`, relevant experience, `relevance_score` |
| `generate_content` | LLM (structured output) | Writes tailored `ResumeContent` using **only facts from the profile** — selection, ranking, and rewording, never invention |
| `render` | Jinja2 + Python | LaTeX-escapes all content in code and renders `templates/resume_template.tex.jinja` → `output/resume.tex` |
| `compile` | `pdflatex` subprocess | Compiles `output/resume.tex` → `output/resume.pdf` (non-zero exit = hard failure with compiler output) |

Shared state (`state.py: ResumeAgentState`): `jd_raw_text`, `profile_path`, `jd_requirements`, `candidate_profile`, `matched_items`, `resume_content`, `rendered_tex_path`, `output_pdf_path`, `error`.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Orchestration | LangGraph (`StateGraph`) |
| LLM / structured output | LangChain (`ChatOpenAI` OpenAI-compatible interface + `with_structured_output`) |
| Validation | Pydantic v2 (`schemas/`) |
| Template rendering | Jinja2 |
| PDF compilation | MiKTeX `pdflatex` (auto-detected on `PATH` or `%LOCALAPPDATA%\Programs\MiKTeX\...`) |
| Frontend (SaaS UI) | React 19 + TypeScript + Vite + Lucide Icons + Custom Modern Design System |
| Tracing | LangSmith (optional, via `.env`) |
| Runtime | Python 3.10+ & Node.js 18+ |

## Project structure

```
resume-agent/
├── frontend/                  # Modern SaaS React + TypeScript web app
│   ├── src/                   # Components, state, styles, mock simulation
│   └── package.json           # Vite build & scripts
├── graph.py                   # LangGraph StateGraph wiring (START -> ... -> END)
├── state.py                   # ResumeAgentState TypedDict
├── config.py                  # Model tier / endpoint config
├── run.py                     # CLI entrypoint (stub — use test.py for now)
├── test.py                    # End-to-end runner: LLM checks + graph.ainvoke
├── master_profile.json        # Single source of truth for all resume facts
├── nodes/                     # read_jd, load_profile, match, generate_content, render, compile
├── schemas/                   # candidate_profile, jd_requirements, matched_items, resume_content
├── templates/resume_template.tex.jinja
├── output/                    # Generated resume.tex / resume.pdf (gitignored)
├── Docs/                      # Spec (resume_agent_spec_v1.md), build log
└── .env.example               # Copy to .env and fill in keys
```

## Prerequisites

- Python 3.10+
- MiKTeX with `pdflatex` (Windows: auto-detected at `%LOCALAPPDATA%\Programs\MiKTeX\miktex\bin\x64\pdflatex.exe` even if not on `PATH`)
- An OpenAI-compatible LLM gateway for `read_jd` / `generate_content` (see Configuration)

## Setup

```powershell
# 1. Virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install langgraph langchain langchain-openai pydantic python-dotenv jinja2

# 2. Environment
copy .env.example .env
# edit .env and set your keys / endpoints

# 3. Profile
# Edit master_profile.json with your real experience — the agent never writes to it,
# it only reads from it.
```

## Configuration

Copy `.env.example` to `.env`:

```ini
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=your-langsmith-api-key
LANGSMITH_PROJECT=resume-agent

GEMMA_API_KEY=
GEMMA_BASE_URL=http://127.0.0.1:8787/v1
GEMMA_MODEL=gemma-e2b
GEMMA_MAX_TOKENS=2048
```

`nodes/read_jd.py` and `nodes/generate_content.py` build their `ChatOpenAI` client from `GEMMA_MODEL` / `GEMMA_API_KEY` / `GEMMA_BASE_URL` / `GEMMA_MAX_TOKENS`. The gateway must be reachable or those nodes raise `OpenAIConnectionError`.

## Usage

`test.py` is the current end-to-end entrypoint (`run.py --jd --profile --out` CLI from the spec is not implemented yet):

```powershell
.\.venv\Scripts\python.exe test.py
```

It runs:

1. `test_structured_output()` — verifies the gateway supports `JDRequirements` structured output.
2. `test_resume_content_output()` — verifies the larger `ResumeContent` structured output with a fixed Python-backend JD.
3. Full `graph.ainvoke({"jd_raw_text": JD_TEXT, "profile_path": "master_profile.json"})` — prints the tailored `resume_content` JSON plus:

```
Rendered LaTeX: C:\...\output\resume.tex
Generated PDF: C:\...\output\resume.pdf
```

### Customizing the JD

Edit `JD_TEXT` in `test.py`:

```python
JD_TEXT = """
We are looking for a Python backend developer.
Required skills include Python and REST APIs.
Experience with FastAPI is preferred.
"""
```

### Customizing the profile

Edit `master_profile.json` (schema: `schemas/candidate_profile.py`). The agent reads it but never writes to it.

## Output

- `output/resume.tex` — rendered LaTeX (all dynamic content LaTeX-escaped in `render.py`, never by the LLM)
- `output/resume.pdf` — compiled PDF (check `output/resume.log` on failure)

The template (`templates/resume_template.tex.jinja`) is a single fixed `article`-class layout with Professional Summary, Experience, Skills, Education, and Certifications sections rendered as `itemize` lists.

## Factuality guarantee

- `generate_content` is explicitly prompted: use only facts from the candidate profile; do not invent companies, dates, technologies, achievements, metrics, or skills.
- `render.py` strips LLM Markdown (`**`, `__`) and escapes LaTeX specials (`& % $ # _ { } ~ ^ \`) before injection.
- `master_profile.json` is read-only for the agent.

## Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| `OpenAIConnectionError: Connection error` in `test.py` | LLM gateway at `GEMMA_BASE_URL` is down or needs auth. Start it / check `.env`, then re-run. |
| `Misplaced alignment tab character &` / LaTeX failure | Fixed in `render.py` — specials are escaped in code. If you add new template placeholders, pass values through `_escape_latex`. |
| `pdflatex was not found` | Install MiKTeX or add its `bin\x64` folder to `PATH`. The node also checks `%LOCALAPPDATA%\Programs\MiKTeX\miktex\bin\x64\pdflatex.exe`. |
| `LaTeX compilation failed` | Read `output/resume.log`; non-zero exit surfaces stdout/stderr with no retry (per spec). |
| `Profile file not found / Invalid JSON / Invalid profile structure` | `load_profile` returns `state["error"]` — check `profile_path` and validate against `schemas/candidate_profile.py`. |

## Roadmap

- [ ] Implement `run.py` CLI (`--jd path/to/jd.txt --profile master_profile.json --out output/resume.pdf`, exit non-zero on `state["error"]`)
- [ ] Surface `state["error"]` with graph halt instead of downstream `KeyError`
- [ ] Restore `config.py` local/cloud tier split (currently all nodes use the `GEMMA_*` gateway)
- [ ] Spec alignment: nested `contact`/`projects` profile shape, Tectonic option, multi-template support
