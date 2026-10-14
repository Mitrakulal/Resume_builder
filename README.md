# AI Resume Agent & Tailoring Engine

An end-to-end, agentic AI platform that takes any Job Description (JD) and generates a tailored, ATS-optimized, high-impact PDF resume in seconds. Grounded strictly in your real-world experience from a single `master_profile.json` source of truth — **no invented jobs, titles, metrics, or hallucinated skills**.

Built with **LangGraph** workflow orchestration, **LangChain** structured JSON outputs, **FastAPI** backend with real-time Server-Sent Events (SSE) streaming, a modern **React + Vite** SaaS frontend, **Jinja2 + LaTeX** document typesetting, and **MiKTeX/pdflatex** engine.

---

## Architecture Overview

```
                                      +------------------------+
                                      |   Job Description (JD) |
                                      +-----------+------------+
                                                  |
                                                  v
+--------------------------------------------------------------------------------------------------+
|                                    LangGraph Orchestration Pipeline                              |
|                                                                                                  |
|   [read_jd]  ======>  [load_profile]  ======>  [match]  ======>  [generate_content]  ===> [render]|
|  (LLM Extractor)     (Profile Loader)      (Gap & Matcher)       (Tailored Synthesis)   (Jinja2) |
+------------------------------------------------------------------------------------------+-------+
                                                                                           |
                                                                                           v
                                                                                      [compile]
                                                                                   (pdflatex subprocess)
                                                                                           |
                                                                                           v
                                                                                  output/resume.pdf
```

### The 5 Pipeline Nodes

| Node | Type | Description |
|------|------|-------------|
| **`read_jd`** | LLM (Structured) | Extracts `JDRequirements`: job title, company, key responsibilities, must-have/nice-to-have skills, and domain keywords. |
| **`load_profile`** | Deterministic Python | Loads `master_profile.json` into a validated `CandidateProfile` Pydantic model with automatic field aliasing (`dates` $\to$ `date`, `school` $\to$ `institution`). |
| **`match`** | Deterministic Python | Intersects candidate skills and experiences against JD requirements; computes `matched_skills`, `gap_areas`, matched experiences, and a `relevance_score`. |
| **`generate_content`** | LLM (Strict Schema) | Rewrites and synthesizes 2–4 action-oriented, tailored bullet points (`bullets: List[str]`) per experience/project, categorizes skills (`SkillCategory`), and crafts a targeted professional summary. |
| **`render`** | Jinja2 + Python | Recursively normalizes Unicode characters (narrow spaces, non-breaking hyphens, smart quotes), escapes LaTeX special characters (`& % $ # _ { } ~ ^ \`), and renders `templates/resume_template.tex.jinja` $\to$ `output/resume.tex`. |
| **`compile`** | `pdflatex` Subprocess | Compiles `output/resume.tex` into a publication-ready `output/resume.pdf` with automated font mapping and ATS micro-typesetting. |

---

## Tech Stack

### Backend
* **Orchestration:** LangGraph (`StateGraph`)
* **LLM Layer:** LangChain `ChatOpenAI` supporting OpenAI, Groq, local inference (Ollama, llama.cpp, vLLM)
* **Data Validation:** Pydantic v2 with Strict Structured Output validation
* **Web Server:** FastAPI + Uvicorn with asynchronous background task runners
* **Streaming:** Server-Sent Events (SSE) for real-time node execution progress
* **Typesetting Engine:** Jinja2 templating + MiKTeX (`pdflatex`)

### Frontend
* **Framework:** React 19 + TypeScript + Vite
* **Styling:** Tailwind CSS + Framer Motion (directional InView scroll animations, defocus blur reveals)
* **Icons:** Lucide React
* **State Management:** React Context API with persistent application tracking

---

## Repository Structure

```
resume-agent/
├── api.py                           # FastAPI REST API & SSE streaming endpoints
├── graph.py                         # LangGraph StateGraph pipeline wiring
├── state.py                         # ResumeAgentState TypedDict definition
├── master_profile.json              # Source of truth candidate profile across multiple domains
├── nodes/                           # Pipeline processing nodes
│   ├── read_jd.py                   # JD requirement extractor
│   ├── load_profile.py              # Candidate profile loader & validator
│   ├── match.py                     # Skill matching & scoring logic
│   ├── generate_content.py          # LLM resume synthesis & bullet generator
│   ├── render.py                    # LaTeX recursive escaper & Jinja template renderer
│   └── compile.py                   # pdflatex compiler subprocess runner
├── schemas/                         # Pydantic v2 schemas
│   ├── candidate_profile.py         # PersonalInfo, ExperienceItem, ProjectItem, EducationItem
│   ├── jd_requirements.py           # JDRequirements schema
│   ├── matched_items.py             # MatchedItems schema
│   └── resume_content.py            # ResumeContent and SkillCategory strict output models
├── templates/
│   └── resume_template.tex.jinja    # Jake's Resume style ATS-optimized LaTeX template
├── output/                          # Generated resume.tex, resume.pdf, and compile logs (gitignored)
├── frontend/                        # React SaaS Application
│   ├── src/
│   │   ├── pages/                   # Landing, NewApplication, MatchView, Profile, Portfolio
│   │   ├── components/              # PipelineRunner, UI primitives, InView animations
│   │   └── store/                   # AppContext state & backend sync
│   └── package.json                 # Frontend dependencies
├── requirements.txt                 # Backend Python dependencies
└── .env.example                     # Environment template
```

---

## Prerequisites

1. **Python 3.10+**
2. **Node.js 18+ & npm**
3. **MiKTeX with pdflatex**
   - Windows: Automatically detected at `%LOCALAPPDATA%\Programs\MiKTeX\miktex\bin\x64\pdflatex.exe` or via `PATH`.
4. **LLM API Key** (Groq, OpenAI, or a local OpenAI-compatible endpoint like Ollama/llama.cpp).

---

## Getting Started

### 1. Backend Setup

```powershell
# Navigate to project root
cd c:\Users\kulal\resume-agent

# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
# (or: pip install langgraph langchain langchain-openai pydantic python-dotenv jinja2 fastapi uvicorn httpx)

# Setup environment variables
copy .env.example .env
```

Configure your `.env` file:
```ini
# Groq Example (Ultra-fast structured outputs)
OPENAI_API_KEY=your_groq_or_openai_api_key
CLOUD_ENDPOINT=https://api.groq.com/openai/v1
OPENAI_MODEL=llama-3.3-70b-versatile

# Or standard OpenAI
# OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4o
```

Start the FastAPI server:
```powershell
uvicorn api:app --reload --port 8000
```
Backend will be live at `http://127.0.0.1:8000` (API documentation at `http://127.0.0.1:8000/docs`).

---

### 2. Frontend Setup

In a new terminal:
```powershell
cd c:\Users\kulal\resume-agent\frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

## Key Features & Design Highlights

### 1. Strict Grounding Guarantee
The LLM is prompted with strict constraints:
- **No Inventions:** Will never fabricate unmentioned companies, degrees, tools, or dates.
- **Dynamic Bullet Generation:** Reads the candidate's raw background descriptions and synthesizes 2 to 4 crisp, action-verb driven bullets tailored directly to the JD requirements.
- **Reframing Over Deletion:** If a candidate has transferable skills in an adjacent domain, the agent reframes their core systems and software engineering achievements rather than returning a blank section.

### 2. Classified Technical Skills
Instead of dumping skills into a flat list, skills are classified using `List[SkillCategory]` complying with OpenAI/Groq's strict schema validator (`additionalProperties: false`):
* **Languages:** TypeScript, Python, C++, SQL, Go
* **Frameworks & Libraries:** React, Next.js, FastAPI, Node.js, PyTorch
* **Databases & Storage:** PostgreSQL, Redis, MongoDB, Snowflake
* **Cloud & DevOps:** AWS, Docker, Kubernetes, CI/CD, Git

### 3. LaTeX Escaping & Unicode Sanitization
LLMs frequently output non-standard typographical characters that crash standard `pdflatex`. The custom recursive escaper in [`nodes/render.py`](nodes/render.py) automatically handles:
* Narrow no-break spaces (`U+202F`) $\to$ regular spaces
* Non-breaking hyphens (`U+2011`) $\to$ `-`
* Smart quotes & en/em dashes $\to$ ASCII/LaTeX quotes and `--` / `---`
* LaTeX special characters (`&`, `%`, `$`, `#`, `_`, `{`, `}`, `~`, `^`) safely escaped.

### 4. Real-time SSE Pipeline Runner
The frontend uses Server-Sent Events to stream the live execution state of the LangGraph pipeline:
1. `read_jd` $\to$ Parsing responsibilities and keywords.
2. `load_profile` $\to$ Loading master profile data.
3. `match` $\to$ Computing skill overlap and gap analysis.
4. `generate_content` $\to$ Synthesizing tailored experience bullets.
5. `render` & `compile` $\to$ Typesetting and generating the final PDF.

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/profile` | `GET` | Fetches the current `master_profile.json`. |
| `/api/profile` | `POST` | Validates and updates `master_profile.json` using `CandidateProfile` schema. |
| `/api/tailor` | `POST` | Starts a background resume tailoring job. Accepts `{ "jd_text": "..." }`, returns `{ "job_id": "...", "status": "started" }`. |
| `/api/tailor/{job_id}/stream` | `GET` | SSE stream emitting node completion events and final PDF URL. |
| `/api/tailor/{job_id}/pdf` | `GET` | Downloads or previews the generated PDF file. |

---

## License
MIT License. Created by [Mitra Kulal](https://github.com/kulalmitra).
