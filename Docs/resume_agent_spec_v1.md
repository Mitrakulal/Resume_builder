# Project Specification: AI Resume Tailoring Agent (v1)

**Document purpose:** This is a complete, unambiguous build specification. An AI coding agent reading this document should be able to implement v1 without needing to ask clarifying questions or make assumptions. Where a decision has not been made, it is explicitly marked `[OPEN DECISION]` rather than left implicit.

---

## 1. Project Summary

A command-line application that takes a job description (JD) as pasted text and a fixed "master profile" of the user's real experience, and produces a tailored resume as a compiled PDF, formatted via LaTeX. The system is orchestrated as a LangGraph state graph. It uses a hybrid LLM strategy: a locally-hosted model for some pipeline stages, and a cloud-hosted model for others (split defined in Section 6).

**The system must never fabricate experience.** All resume content must be traceable to entries in the master profile. The LLM's role is selection, ranking, reordering, and rewording — never invention of new facts, employers, titles, dates, or skills not present in the source profile.

---

## 2. Goals and Non-Goals (v1)

### In scope for v1
- Accept a JD as pasted plain text (via CLI argument or file path)
- Load one master profile file (JSON) as the single source of truth
- Rank/match profile content against the JD
- Generate tailored resume content as structured data
- Render that content into one fixed LaTeX template
- Compile the LaTeX to a PDF
- Run as a linear, non-branching pipeline (no loops, no retries, no human-in-the-loop pause)
- Run entirely from the command line

### Explicitly out of scope for v1
- JD ingestion from a URL or PDF file (pasted text only)
- Automated proofread → regenerate retry loop
- Multiple LaTeX templates or template selection
- Any web UI or GUI
- Human-in-the-loop confidence flagging or review checkpoints
- Cover letter generation
- Persisting run history or multiple resume versions
- Automated compile-failure recovery (a failed compile should error out with a clear message, not self-correct)

---

## 3. High-Level Architecture

```
[Pasted JD text]                [master_profile.json]
        |                                |
        v                                v
   ┌─────────┐                     ┌─────────┐
   │ Read JD │                     │  Load   │
   │  Node   │                     │ Profile │
   └────┬────┘                     └────┬────┘
        └───────────────┬───────────────┘
                         v
                   ┌───────────┐
                   │   Match   │
                   │   Node    │
                   └─────┬─────┘
                         v
                   ┌───────────┐
                   │ Generate  │
                   │  Content  │
                   │   Node    │
                   └─────┬─────┘
                         v
                   ┌───────────┐
                   │  Render   │
                   │   Node    │
                   │ (Jinja2)  │
                   └─────┬─────┘
                         v
                   ┌───────────┐
                   │  Compile  │
                   │   Node    │
                   │ (Tectonic)│
                   └─────┬─────┘
                         v
                  [tailored_resume.pdf]
```

This is a **strictly linear graph**: no conditional edges, no cycles, no retries in v1. Every node runs exactly once per invocation.

---

## 4. LangGraph State Schema

The graph's shared state object, passed between all nodes, must have exactly this shape:

```python
from typing import TypedDict, List, Dict, Optional

class ResumeAgentState(TypedDict):
    # --- Inputs ---
    jd_raw_text: str                    # raw pasted job description text
    profile_path: str                   # filesystem path to master_profile.json

    # --- Populated by Read JD node ---
    jd_requirements: Dict                # structured extraction, see Section 7.1

    # --- Populated by Load Profile node ---
    candidate_profile: Dict              # parsed master_profile.json, see Section 8

    # --- Populated by Match node ---
    matched_items: List[Dict]            # ranked matches, see Section 7.2

    # --- Populated by Generate Content node ---
    resume_content: Dict                 # structured resume content, see Section 7.3

    # --- Populated by Render node ---
    rendered_tex_path: str               # path to filled .tex file

    # --- Populated by Compile node ---
    output_pdf_path: str                 # path to final compiled PDF

    # --- Error tracking (set by any node on failure) ---
    error: Optional[str]
```

Every node reads only the fields it needs and writes only the fields listed as "populated by" that node. No node should mutate fields outside its designated output.

---

## 5. Node-by-Node Specification

### 5.1 Read JD Node
- **Input:** `state["jd_raw_text"]` (plain string, already in memory — no file I/O in this node for v1)
- **Process:** Single LLM call. Extract structured requirements from the free-text JD.
- **Output:** `state["jd_requirements"]` — see schema in Section 7.1
- **Model tier:** see Section 6
- **Failure mode:** if extraction returns empty/malformed JSON, set `state["error"]` and halt the graph (do not proceed to Match).

### 5.2 Load Profile Node
- **Input:** `state["profile_path"]`
- **Process:** Pure code, no LLM call. Read the JSON file from disk, validate against the schema in Section 8 (all required fields present, correct types). Use a JSON Schema or Pydantic model for validation — do not proceed silently if validation fails.
- **Output:** `state["candidate_profile"]`
- **Failure mode:** if file is missing or fails schema validation, set `state["error"]` with the specific validation error and halt.

### 5.3 Match Node
- **Input:** `state["jd_requirements"]`, `state["candidate_profile"]`
- **Process:** Single LLM call. For each requirement in the JD, identify which entries in the candidate profile (projects, skills, experience items) are relevant, and assign a relevance ranking. The model must only reference `id` values that exist in the candidate profile — it must not invent new profile entries at this stage.
- **Output:** `state["matched_items"]` — see schema in Section 7.2
- **Model tier:** see Section 6

### 5.4 Generate Content Node
- **Input:** `state["matched_items"]`, `state["candidate_profile"]`, `state["jd_requirements"]`
- **Process:** Single LLM call. Using only the matched items (not the full profile), produce final resume content: a summary line, ordered bullet points per experience/project entry (reworded toward JD keywords, but factually unchanged from the source `description` fields), and an ordered skills list.
- **Constraint:** The model must not introduce any skill, technology, employer, title, or metric that does not appear in the corresponding profile entry's source fields. Rewording and keyword alignment are permitted; fact invention is not.
- **Output:** `state["resume_content"]` — see schema in Section 7.3
- **Model tier:** see Section 6

### 5.5 Render Node
- **Input:** `state["resume_content"]`
- **Process:** Pure code, no LLM call. Load the fixed LaTeX template (Section 9), substitute placeholders using Jinja2, and apply LaTeX special-character escaping (see Section 9.3) to every user-derived string before injection.
- **Output:** `state["rendered_tex_path"]` — path to the written `.tex` file (e.g. `output/resume.tex`)
- **Failure mode:** if any required placeholder in `resume_content` is missing, set `state["error"]` and halt before writing the file.

### 5.6 Compile Node
- **Input:** `state["rendered_tex_path"]`
- **Process:** Pure code, no LLM call. Invoke the LaTeX compiler (Section 10) as a subprocess against the rendered `.tex` file.
- **Output:** `state["output_pdf_path"]`
- **Failure mode:** if the compiler subprocess returns a non-zero exit code, set `state["error"]` with the captured stderr/log output and halt. Do not attempt automatic recovery in v1 (Section 2, out of scope).

---

## 6. Hybrid Model Strategy (Local + Cloud)

The pipeline uses two model tiers. The split below is the default; treat it as configurable via environment variables, not hardcoded.

| Node | Model tier | Rationale |
|---|---|---|
| Read JD | **Local** | Simple extraction task; JD text may contain content the user prefers not to send externally; low reasoning demand |
| Match | **Local** | Operates directly on the full candidate profile (personal data); keeping this local limits how much personal data leaves the machine; matching/ranking is a moderate-complexity task well within a 14B-class model's ability |
| Generate Content | **Cloud** | Highest-quality-sensitive step — output phrasing directly affects the final resume; benefits most from a stronger model's writing quality |

- **Local model:** served via the existing local Ollama endpoint (Qwen3 14B, Q4_K_M), reachable over Tailscale from the machine running this agent. `[OPEN DECISION: confirm the exact local endpoint URL/port and whether this script runs on the same machine as the Mac Mini server or connects remotely.]`
- **Cloud model:** `[OPEN DECISION: which provider/model — e.g. Anthropic Claude API, OpenAI API. Needs an API key and a chosen model string.]`
- Both model clients should be wrapped through LangChain's chat model interface so nodes call a common interface (e.g. `ChatOllama` for local, `ChatAnthropic` or `ChatOpenAI` for cloud) and the tier used per node is a config value, not hardcoded logic inside the node.
- All LLM calls that produce structured output (Read JD, Match, Generate Content) must use LangChain's structured output / Pydantic parsing so the returned object is validated against the schemas in Section 7, regardless of which tier produced it.

---

## 7. Data Schemas (LLM-produced structures)

### 7.1 `jd_requirements` (output of Read JD node)
```json
{
  "job_title": "string",
  "must_have_skills": ["string", "..."],
  "nice_to_have_skills": ["string", "..."],
  "responsibilities": ["string", "..."],
  "keywords": ["string", "..."]
}
```

### 7.2 `matched_items` (output of Match node)
```json
[
  {
    "profile_entry_id": "string (must match an id in candidate_profile)",
    "relevance_score": 0.0,
    "matched_requirement": "string (which JD requirement this addresses)"
  }
]
```
- `relevance_score` is a float from 0.0 to 1.0.
- List should be sorted descending by `relevance_score`.

### 7.3 `resume_content` (output of Generate Content node)
```json
{
  "summary": "string, 1-3 sentences",
  "sections": [
    {
      "section_title": "string, e.g. 'Experience' or 'Projects'",
      "entries": [
        {
          "heading": "string, e.g. role/title + org, or project name",
          "subheading": "string, e.g. dates or context",
          "bullets": ["string", "..."]
        }
      ]
    }
  ],
  "skills": ["string", "..."]
}
```

---

## 8. Master Profile Schema (`master_profile.json`)

This file is authored once, by hand, by the user, and is never written to by the agent. It is the sole source of truth for all resume content.

```json
{
  "contact": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "links": ["string", "..."]
  },
  "experience": [
    {
      "id": "string, unique, e.g. 'exp-001'",
      "title": "string",
      "organization": "string",
      "start_date": "string",
      "end_date": "string",
      "description": "string, factual, first-person or neutral, the ground truth the LLM rewords from",
      "skills_used": ["string", "..."]
    }
  ],
  "projects": [
    {
      "id": "string, unique, e.g. 'proj-001'",
      "name": "string",
      "description": "string, factual ground truth",
      "skills_used": ["string", "..."],
      "date": "string"
    }
  ],
  "skills": ["string", "..."],
  "education": [
    {
      "id": "string, unique",
      "institution": "string",
      "degree": "string",
      "start_date": "string",
      "end_date": "string"
    }
  ]
}
```
- Every `id` field must be unique across the whole file — the Match node references entries by `id`.
- `description` fields are the only fields the Generate Content node is permitted to reword; it must not alter dates, titles, or organization names.

---

## 9. LaTeX Template

### 9.1 Template choice
`[OPEN DECISION: which specific existing LaTeX resume template to adapt — e.g. a single-column ATS-friendly template. Must be finalized before the Render node can be implemented, since placeholder names depend on the template's section structure.]`

### 9.2 Placeholder convention
Once a template is chosen, every dynamic value must be exposed as a Jinja2 placeholder matching the `resume_content` schema fields directly (e.g. `{{ summary }}`, a `{% for section in sections %}` loop over sections/entries/bullets, `{{ skills | join(', ') }}`). No placeholder should require data not present in the `resume_content` schema in Section 7.3.

### 9.3 Escaping requirement
Before injection, every string value from `resume_content` must be passed through a LaTeX-escaping function that at minimum escapes: `& % $ # _ { } ~ ^ \`. This must run in the Render node, in code — never rely on the LLM to produce pre-escaped LaTeX.

---

## 10. Compilation

- **Compiler:** Tectonic (preferred, self-contained, no full TeX Live install required) invoked as a subprocess: `tectonic <path>.tex`. `[OPEN DECISION: confirm Tectonic vs pdflatex/latexmk depending on what's available in the runtime environment.]`
- Compilation happens in an isolated working/output directory so intermediate LaTeX build artifacts don't pollute the project root.
- Non-zero exit code = hard failure, surfaced to the user with the compiler's stderr output. No retry in v1.

---

## 11. Technology Stack

| Layer | Technology |
|---|---|
| Orchestration | LangGraph |
| LLM calls, prompts, structured output parsing | LangChain |
| Local LLM | Ollama, Qwen3 14B (Q4_K_M) |
| Cloud LLM | `[OPEN DECISION — Section 6]` |
| Template rendering | Jinja2 |
| LaTeX compilation | Tectonic (preferred) |
| Language / runtime | Python |
| Interface | CLI script |

---

## 12. CLI Interface (v1)

```
python run.py --jd path/to/jd.txt --profile path/to/master_profile.json --out output/resume.pdf
```
- `--jd`: path to a plain text file containing the pasted JD (v1 reads JD from a file, not stdin, to keep the CLI simple and scriptable)
- `--profile`: path to `master_profile.json`
- `--out`: desired output PDF path
- On success: print the final PDF path and exit 0
- On failure: print `state["error"]` to stderr and exit non-zero

---

## 13. Project File Structure

```
resume-agent/
├── run.py                     # CLI entrypoint, builds and invokes the graph
├── graph.py                   # LangGraph StateGraph definition and node wiring
├── state.py                   # ResumeAgentState TypedDict (Section 4)
├── nodes/
│   ├── read_jd.py
│   ├── load_profile.py
│   ├── match.py
│   ├── generate_content.py
│   ├── render.py
│   └── compile.py
├── schemas/
│   ├── jd_requirements.py     # Pydantic model, Section 7.1
│   ├── matched_items.py       # Pydantic model, Section 7.2
│   ├── resume_content.py      # Pydantic model, Section 7.3
│   └── candidate_profile.py   # Pydantic model, Section 8
├── templates/
│   └── resume_template.tex.jinja
├── master_profile.json        # user's real data, hand-authored
├── output/                    # rendered .tex and compiled .pdf land here
└── config.py                  # model tier config (local/cloud endpoints, model names)
```

---

## 14. Success Criteria for v1

v1 is complete when: given a pasted JD text file and a filled-in `master_profile.json`, running the CLI command in Section 12 produces a compiled PDF resume whose content is (a) drawn only from the master profile, (b) reordered/reworded toward the JD's stated requirements, and (c) free of LaTeX compilation errors — with no manual intervention between input and output.

---

## 15. Open Decisions Summary

For quick reference, everything not yet finalized:
1. Local model endpoint details (exact URL/port, same-machine vs remote)
2. Cloud model provider and model string
3. Specific LaTeX template to adapt
4. Tectonic vs pdflatex/latexmk for the compile step
