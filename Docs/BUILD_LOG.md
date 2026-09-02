# Resume Agent Build Log

This is the living learning and implementation record for the resume agent. Update it after each meaningful coding step, test, or design decision.

## Project Goal

Build a command-line application that accepts a job description and the user's hand-authored `master_profile.json`, then produces a tailored PDF resume.

The system must never invent experience, skills, employers, dates, titles, or metrics. The master profile is the only source of truth.

## Current Architecture

The workflow is a linear LangGraph pipeline with six application nodes:

```text
JD text + profile path
        |
        +--> Read JD --------+
        |                    |
        +--> Load Profile ---+--> Match --> Generate Content --> Render --> Compile --> PDF
```

- `Read JD`: local LLM extracts structured job requirements.
- `Load Profile`: Python reads and validates `master_profile.json`.
- `Match`: local LLM ranks profile entries against the job requirements.
- `Generate Content`: cloud LLM writes fact-grounded resume content.
- `Render`: Python and Jinja2 create a LaTeX file.
- `Compile`: Python runs Tectonic and creates the PDF.

`START` and `END` are LangGraph graph markers, not application nodes.

## Where To Start Coding

Start with the shared state contract and profile validation before adding LLM calls. These pieces define the data flowing through the entire graph and are easy to test without API keys.

### Step 1: Define `ResumeAgentState`

Implement the fields specified in `state.py`:

- `jd_raw_text`
- `profile_path`
- `jd_requirements`
- `candidate_profile`
- `matched_items`
- `resume_content`
- `rendered_tex_path`
- `output_pdf_path`
- `error`

### Step 2: Align the Pydantic schemas

Make the models match the project specification, especially the nested `contact`, `experience`, `projects`, and `education` profile structure.

### Step 3: Implement and test `load_profile`

This is the first real node because it is deterministic:

1. Read the JSON path from state.
2. Parse the JSON.
3. Validate it with `CandidateProfile`.
4. Return `candidate_profile` or a clear error.

## Implementation Checklist

- [x] Define the shared state contract.
- [ ] Define the complete Pydantic schemas.
- [ ] Update `master_profile.json` to the documented profile shape.
- [ ] Implement `load_profile`.
- [ ] Add a small profile-loading test.
- [ ] Implement `render` and LaTeX escaping.
- [ ] Implement `compile` with Tectonic.
- [ ] Add model configuration for local and cloud providers.
- [ ] Implement structured-output `read_jd`.
- [ ] Implement structured-output `match`.
- [ ] Implement fact-grounded `generate_content`.
- [ ] Wire the six nodes in `graph.py`.
- [ ] Implement CLI input and graph invocation in `run.py`.
- [ ] Run an end-to-end test and inspect the generated PDF.

## State Learning Note

The state is temporary data for one graph execution. Each node receives the current state and returns only its own update. LangGraph carries those updates to the next node. `master_profile.json` is permanent source data; graph state is temporary workflow data.

## Model Strategy

- Local model: `Read JD` and `Match`, because these steps process private job and profile information.
- Cloud model: `Generate Content`, because writing quality matters most here.
- Deterministic Python: `Load Profile`, `Render`, and `Compile`.

Model names and endpoints must come from configuration or environment variables, not be hardcoded inside nodes.

## Change Log

### 2026-09-02

- Created this living build and learning log.
- Confirmed six application nodes are planned.
- Confirmed the existing node, graph, state, and CLI files are scaffolds.
- Chosen first learning topic: the shared state contract.
- No code was implemented; `state.py` remains the original scaffold.

#### State Learning

- `TypedDict` documents the keys and expected value types that travel through one graph execution; it does not create runtime storage.
- The state is intentionally temporary. The profile file remains the permanent source of truth and is loaded into `candidate_profile` for this run.
