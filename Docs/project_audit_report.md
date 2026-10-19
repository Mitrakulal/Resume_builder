# Project Audit Report — AI Resume Agent & Tailoring Engine

**Audit date:** 2026-10-19  
**Repository:** `C:\Users\kulal\resume-agent`  
**Commit reviewed:** `ca832d5` ("Portfolio page fixed")  
**Review type:** Read-only static review of the backend, frontend, schemas, LaTeX template, generated artifacts, and documentation. No application code was changed during the review. No test suite, load test, or penetration test was executed. Secret values were not read or reproduced; only environment variable names were inspected.

> This report accompanies the README rewrite. The README now describes the project's actual behavior; this document records every material issue found and the recommended fix.

---

## 1. Executive summary

The project is a **well-structured, working prototype** with a clean LangGraph pipeline and an unusually polished frontend. The happy path — JD text → structured requirements → tailored content → LaTeX → PDF — runs and produces a real document.

It is **not yet the "industry-grade, trust-first" system** described in `Docs/industry_grade_resume_agent_blueprint.md` or the previous README. The largest gaps are:

1. **Factual grounding is prompt-only.** There is no programmatic verification, no source-ID contract, and no metric/entity lock. The generated resume already shows attribution drift (a Terraform bullet attached to a role whose source entry does not mention Terraform).
2. **The match score is not meaningful.** Matching is case-insensitive exact-string equality, ignores projects, ignores evidence inside experience, and weights keywords the same as must-have skills.
3. **The job/runtime model is single-user and unsafe for concurrency.** Every job writes the same `output/resume.tex` and `output/resume.pdf`; jobs live in memory; SSE events cannot be replayed.
4. **The local API is effectively unauthenticated.** Wildcard CORS plus no auth means any website that can reach `127.0.0.1:8000` can read the candidate profile, overwrite it, or fetch the last generated resume through the PDF fallback.
5. **The frontend is two products at once.** Some screens call the real backend; most still render fictional demo data. A custom JD is shown beside an unrelated sample JD and a fabricated match score.
6. **Setup and repository hygiene are incomplete.** There is no `requirements.txt`/`pyproject.toml`, no tests, no CI, no `LICENSE`, and `test.py` is a stale duplicate of `api.py` rather than a test suite.

The good news: the architecture is small enough that most of these are fixable without a rewrite. The blueprint document already names several of them accurately. The recommendations at the end are ordered by risk and effort.

---

## 2. Scorecard

| Area | Rating | Summary |
|---|---|---|
| Backend pipeline structure | **Good** | Clear node boundaries, typed state, deterministic render/compile steps. |
| Factual grounding | **Critical gap** | Prompt-only enforcement; output schema allows invented attribution and outcomes. |
| Matching logic | **Weak** | Exact string equality; misleading score; projects ignored. |
| Error handling | **Weak** | Node errors are returned but not routed; no retries or timeouts. |
| API/runtime | **Prototype** | In-memory jobs, shared output files, no replay, no cleanup. |
| Security/privacy | **Critical for local use** | No auth, wildcard CORS, arbitrary-ID PDF fallback, non-atomic profile writes. |
| Frontend integration | **Half-finished** | Real API for profile/job/PDF; demo data for nearly everything else. |
| LaTeX output | **Needs hardening** | Two pages, overfull boxes, no page budget or ATS verification. |
| Setup/reproducibility | **Incomplete** | Missing dependency file; env example does not match the code. |
| Tests/CI | **Missing** | No automated tests, linting, or CI. `test.py` is not a test suite. |

---

## 3. What works well

These are worth preserving while fixing the issues below.

- **Clear pipeline ownership.** `read_jd`, `load_profile`, `match`, `generate_content`, `render`, and `compile` each do one thing, and `graph.py` is easy to read.
- **Typed contracts.** `ResumeAgentState` plus the Pydantic schemas make the data flow explicit. Validation catches profile-shape errors early.
- **Deterministic where it matters.** Profile loading, matching, rendering, and compiling are plain Python. That is the right split for a document pipeline.
- **Thoughtful LaTeX handling.** `nodes/render.py` normalizes narrow spaces, non-breaking hyphens, smart quotes, en/em dashes, and protects backslashes before escaping braces. This is more care than most resume generators take.
- **SSE streaming concept.** A node-by-node progress view is a strong UX choice and maps naturally to LangGraph's `astream`.
- **The blueprint is self-aware.** `Docs/industry_grade_resume_agent_blueprint.md` correctly identifies the exact-match matcher, prompt-only factuality, and single-PDF overwrite as baseline weaknesses.
- **Basic repository hygiene.** `.env` is gitignored and absent from git history; `output/`, `node_modules/`, and `dist/` are ignored.

---

## 4. Severity legend

| Severity | Meaning |
|---|---|
| **Critical** | Breaks the core promise, exposes private data, or can destroy the source-of-truth profile. Fix before sharing the project. |
| **High** | Likely to produce incorrect or misleading results, corrupt output, or make the app fail in normal use. |
| **Medium** | Reliability, maintainability, or UX problem that will bite during real use or development. |
| **Low** | Polish, consistency, or documentation issue. |

---

## 5. Findings

### 5.1 Factual grounding and trust (`GRD`)

#### GRD-01 — Generation schema allows the model to rewrite facts (Critical)

**Where:** `schemas/resume_content.py:16-23`

`ResumeContent` reuses `ExperienceItem`, `ProjectItem`, and `EducationItem`, which include `company`, `role`, `date`, `institution`, and `degree`. The LLM therefore returns the entire employment record, not just tailored bullets. Nothing in the schema requires those values to match the source profile.

**Impact:** The model can rename a role, change a date, invent a company, or attach a different degree while still satisfying the schema. The README's "no invented jobs, titles, dates" promise is not structurally enforced.

**Suggestion:** Introduce an output model such as `TailoredExperience { source_id, bullets[] }` and `TailoredProject { source_id, bullets[] }`. Join company, role, location, dates, institution, and degree deterministically from `CandidateProfile` after generation.

---

#### GRD-02 — The full profile is sent to the generator; matching does not constrain it (High)

**Where:** `nodes/generate_content.py:51-58`, `nodes/match.py:58-64`

The prompt includes the entire `candidate_profile`, the JD requirements, and the match result. The model is free to select any experience or project regardless of what `match` computed.

**Impact:** The deterministic matching step has almost no influence on the output. Provenance and selection logic cannot be reasoned about or tested, and the model is exposed to irrelevant profile entries that increase token usage and hallucination risk.

**Suggestion:** Pass the selected entries (with source IDs and source text) rather than the full profile. Let `match` decide the candidate set; let the LLM only rewrite bullets for that set.

---

#### GRD-03 — No programmatic grounding verification (Critical)

**Where:** `graph.py:19-32`, `nodes/generate_content.py:31-59`

There is no `verify_groundedness` node, no entity extraction/allowlist, no numeric-metric lock, and no bullet-level provenance. Prompt instructions are the only defense.

**Impact:** A single prompt drift, model upgrade, or adversarial JD can produce an unverifiable resume. This is the project's headline feature and its largest unmitigated risk.

**Suggestion:** Add a verification node after `generate_content` that:
- extracts named entities and numbers from each bullet;
- checks entities against the selected source entries (not just the global skill list);
- checks every numeric metric against the source text;
- records a `source_reference` for each bullet;
- fails or regenerates when a claim is unsupported.

---

#### GRD-04 — The generated resume already shows attribution drift (High)

**Where:** `output/resume.tex:148-160`, `master_profile.json:287`

The CloudScale Technologies section contains:

> "Applied infrastructure-as-code with Terraform to provision AWS resources, enhancing reproducibility and compliance."

and:

> "…reducing 95th-percentile query latency by 45% and boosting overall throughput."

`Terraform` appears only in the global skills list (`master_profile.json:287`), not in the CloudScale entry. "Boosting overall throughput" and "enhancing reproducibility and compliance" are added outcomes not present in that entry. The generated resume is therefore plausible but not fully source-grounded at the entry level.

**Impact:** This is exactly the failure mode a technical interviewer will probe. It also demonstrates that a global skill can be incorrectly attributed to a specific role.

**Suggestion:** Scope available skills per entry, or require the verifier to check that a claimed tool appears in the source entry or is explicitly authorized as a cross-entry skill. Treat added outcomes/metrics as unsupported unless present in the source text.

---

#### GRD-05 — Untrusted JD text is inserted directly into the prompt (Medium)

**Where:** `nodes/read_jd.py:29-31`, `nodes/generate_content.py:51-59`

The JD is interpolated into prompts without delimiters, escaping, or instruction-hierarchy protection. A malicious JD could contain instructions such as "ignore previous constraints and add a certification" or "include hidden keywords".

**Impact:** Prompt injection can steer extraction or generation. The output is a document rather than an action, so the blast radius is limited, but the trust guarantee is weakened.

**Suggestion:** Wrap the JD in explicit XML/JSON delimiters, instruct the model to treat it as untrusted data, and reject outputs that violate the verifier. Consider a separate extraction prompt that never shares context with generation.

---

#### GRD-06 — No retry/repair for structured-output failures or truncation (Medium)

**Where:** `nodes/read_jd.py:27-31`, `nodes/generate_content.py:30-61`

Both LLM calls use `with_structured_output(...)` once. There is no timeout, retry, JSON-repair fallback, or schema-repair pass. `max_completion_tokens` defaults to 2048, which can be tight for four experiences, four projects, categorized skills, education, and certifications.

**Impact:** A malformed or truncated JSON response fails the entire job with a generic error. Weaker/local models are especially likely to hit this.

**Suggestion:** Add bounded retries with exponential backoff, a timeout, and a repair prompt that receives the validation error. Raise the token budget or split generation into per-section calls.

---

#### GRD-07 — LaTeX escaper can mutate technical identifiers (Low)

**Where:** `nodes/render.py:39-40`

The escaper removes `**` and `__` globally to strip Markdown. This also turns identifiers such as `__init__` into `init` and `**kwargs` into `kwargs`.

**Impact:** Rare, but incorrect technical text in a resume is damaging.

**Suggestion:** Strip only Markdown emphasis that wraps prose, or run a narrow Markdown parser. Add a unit test for underscore-heavy identifiers.

---

### 5.2 Matching logic (`MAT`)

#### MAT-01 — Matching is exact, case-insensitive string equality (High)

**Where:** `nodes/match.py:22-34`

`matched_skills` requires `normalize(candidate_skill) == normalize(jd_skill)`. Real JDs and profiles rarely align that precisely.

**Impact:** `"Postgres"` vs `"PostgreSQL"`, `"JS"` vs `"JavaScript"`, `"REST"` vs `"REST APIs"`, and `"CI/CD"` vs `"continuous integration"` all fail. The score under-reports fit and the gap list over-reports missing skills.

**Suggestion:** Add an alias/canonicalization table and a taxonomy (language, framework, database, cloud, tool, methodology). Consider embeddings or fuzzy matching for remaining pairs, with a confidence threshold.

---

#### MAT-02 — Substring matching produces false positives (High)

**Where:** `nodes/match.py:52`

`any(normalize(skill) in summary.lower() for skill in jd_skills)` matches substrings anywhere in the summary. `"Go"` matches `"Google"`, `"R"` matches almost everything, and short acronyms match unrelated words.

**Impact:** Irrelevant experience is marked as matched, inflating `matched_experience` and misleading the generator/UI.

**Suggestion:** Use token-boundary matching (`\b`) plus normalized aliases, or remove the substring heuristic and match against structured `skills` fields.

---

#### MAT-03 — The relevance score is misleading (High)

**Where:** `nodes/match.py:14-17`, `55-56`

The denominator is the union of must-have skills, nice-to-have skills, and keywords. Keywords often include job titles and generic terms, and all three categories are weighted equally. The numerator counts only exact top-level skill matches.

**Impact:** A score of "92%" or "40%" does not correspond to a defensible hiring signal. The frontend presents it as a key metric (`ScoreRing`, dashboard averages), so users will trust a number that is not calibrated.

**Suggestion:** Define the score explicitly: weight must-haves highest, nice-to-haves lower, keywords lowest or not at all; separate skill coverage from evidence coverage; document the formula; add unit tests with known fixtures.

---

#### MAT-04 — Projects and per-entry skills are ignored (Medium)

**Where:** `nodes/match.py:19-20`, `36-53`

`candidate_skills` is built only from `candidate_profile.skills`. Project skills and experience-level skills are only used incidentally in the experience substring check; projects are never examined.

**Impact:** Strong project evidence (often the best evidence for early-career candidates) is invisible to the matcher and to the score.

**Suggestion:** Flatten skills from experience and projects into the candidate vocabulary with source references, and score both experiences and projects.

---

#### MAT-05 — `matched_experience` is flattened and bloated (Medium)

**Where:** `nodes/match.py:36-53`

Each match becomes a single `"Role: description"` string, losing company, dates, and IDs. If a role matches, the entire description (often a long paragraph) is appended.

**Impact:** The generator receives huge, unstructured blobs; provenance is lost; token usage grows; UI/result features cannot link back to a specific entry.

**Suggestion:** Return structured matches with `source_type`, `source_id`, `relevance`, `matched_terms`, and the original fields. Keep source text separate from rewritten bullets.

---

#### MAT-06 — Gap analysis ignores evidence outside the flat skills list (Medium)

**Where:** `nodes/match.py:32-34`

`gap_areas` is every JD skill not present in the top-level `candidate_profile.skills`, even if the skill is clearly demonstrated in an experience or project description.

**Impact:** The gap list overstates missing skills and may push the generator toward irrelevant reframing.

**Suggestion:** Build candidate evidence from all sections before computing gaps; report "no evidence" rather than "missing skill" when appropriate.

---

### 5.3 Pipeline and error handling (`PIPE`)

#### PIPE-01 — Node errors are returned but ignored (High)

**Where:** `nodes/load_profile.py:18-25`, `graph.py:26-32`

`load_profile` returns `{"error": "..."}` for a missing file, invalid JSON, or validation failure, but the graph has an unconditional edge to `match`. `match` then raises `KeyError` on `state["candidate_profile"]`.

**Impact:** The original, actionable error is replaced by a generic pipeline exception. Users see a worse message and debugging is harder.

**Suggestion:** Add a conditional edge after every node: if `state.get("error")`, route to `END` or an error handler. Ensure the API surfaces the original message.

---

#### PIPE-02 — No conditional routing or explicit error contract (High)

**Where:** `graph.py:26-32`, `state.py:26`

The graph is strictly linear, which is fine for v1, but there is no failure path. `state["error"]` is declared and never used.

**Impact:** Any node can fail in an uncontrolled way. There is no consistent error shape for the SSE stream or the frontend.

**Suggestion:** Define a small error contract (`error`, `error_node`, `error_code`) and route failures to a terminal node. Keep the graph linear on the success path.

---

#### PIPE-03 — Model clients are constructed at import time (High)

**Where:** `nodes/read_jd.py:14-21`, `nodes/generate_content.py:15-22`

Both modules create a `ChatOpenAI` client at import. If the API key is missing or malformed, importing `api.py` fails, so even `/api/health` cannot start.

**Impact:** The server is unavailable for configuration errors that should be reported at request time. Tests that import the graph also require real credentials.

**Suggestion:** Create clients lazily in a factory, validate configuration at startup with a clear message, and allow dependency injection/mocking in tests.

---

#### PIPE-04 — Provider/API-mode heuristic is fragile (Medium)

**Where:** `nodes/read_jd.py:20`, `nodes/generate_content.py:21`

`use_responses_api=False if os.getenv("GEMMA_BASE_URL") else True` keys off a legacy variable name rather than the actual provider. Setting `CLOUD_ENDPOINT` to Groq without `GEMMA_BASE_URL` selects the Responses API, which Groq does not implement.

**Impact:** The README's Groq example can fail depending on which variables are present. Configuration behavior is surprising.

**Suggestion:** Add an explicit `LLM_API_MODE=chat|responses` setting, or infer from the provider. Remove the `GEMMA_*`-based branch once the new config is in place.

---

#### PIPE-05 — No timeouts or retries around LLM calls (Medium)

**Where:** `nodes/read_jd.py:29-31`, `nodes/generate_content.py:61`

A hung provider call hangs the job indefinitely. There is no per-call timeout, retry, or circuit breaker.

**Impact:** A single network hiccup leaves the SSE stream open and the UI stuck.

**Suggestion:** Set client-level timeouts and bounded retries; emit a clear `error` event when the budget is exhausted.

---

#### PIPE-06 — Input/placeholder validation is incomplete (Medium)

**Where:** `nodes/load_profile.py:13`, `nodes/render.py:93-96`

`load_profile` opens the file without `encoding="utf-8"`, which can misdecode on Windows. `render` does not validate that required fields exist before writing the `.tex` file (the spec says it should).

**Impact:** Encoding bugs on non-ASCII profiles and partially rendered documents instead of a clear pre-render failure.

**Suggestion:** Read/write with explicit UTF-8 and validate the render context (`personal_info.name`, `email`, section shapes) before writing.

---

### 5.4 API, runtime, and security (`API`)

#### API-01 — Jobs are in-memory and never expire (High)

**Where:** `api.py:41-43`, `159-178`

`jobs` is a module-level dictionary. It is lost on restart, never cleaned up, and not shared across workers.

**Impact:** Reloading the server breaks in-flight and completed jobs. Memory grows without bound. Running multiple Uvicorn workers breaks the job/SSE relationship.

**Suggestion:** Use a small persistent store (SQLite is enough for local use) with job status, timestamps, and TTL cleanup. Document single-worker mode until then.

---

#### API-02 — All jobs share the same output files (High)

**Where:** `nodes/render.py:95`, `nodes/compile.py:63`

Every run writes `output/resume.tex` and `output/resume.pdf`. There is no per-job directory or lock.

**Impact:** Two concurrent jobs overwrite each other; a user can receive another job's PDF; compile logs become mixed.

**Suggestion:** Create `output/{job_id}/` per run and pass the path through state. Add a file lock or unique temp directory. Clean up old runs with a TTL.

---

#### API-03 — Unknown job IDs return the last generated PDF (Critical)

**Where:** `api.py:196-219`

If the job is missing or has no `pdf_path`, the endpoint falls back to `OUTPUT_DIR / "resume.pdf"`. Any caller can request `/api/tailor/anything/pdf` and receive the most recent resume.

**Impact:** Private candidate data is exposed to any web page or local process that can reach the port, even without knowing a valid job ID.

**Suggestion:** Return `404` unless the job exists and owns a PDF. Store PDFs under per-job paths and authorize access. Never use a global fallback.

---

#### API-04 — No authentication and wildcard CORS (Critical)

**Where:** `api.py:28-34`, `58-86`

`allow_origins=["*"]` plus no auth means any website can call the API. `GET /api/profile` leaks the profile; `POST /api/profile` overwrites the source of truth; `POST /api/tailor` consumes LLM credits.

**Impact:** A malicious page visited while the server is running can exfiltrate or corrupt the user's profile and trigger paid inference.

**Suggestion:** For local use, allow only `http://localhost:5173` and `http://127.0.0.1:5173`, require a per-session token or bearer key, and bind to `127.0.0.1` only. Do not enable credentials with a wildcard origin.

---

#### API-05 — Profile writes are non-atomic with no backup (High)

**Where:** `api.py:70-86`

`PROFILE_PATH.write_text(...)` truncates and rewrites the source of truth in place. A crash, disk-full event, or concurrent read can leave it partially written.

**Impact:** The only copy of the master profile can be corrupted. There is no version history to recover from.

**Suggestion:** Write to a temp file in the same directory, `os.replace` it atomically, keep the previous version as `master_profile.backup.json`, and optionally store timestamped copies.

---

#### API-06 — SSE is single-consumer with no replay (High)

**Where:** `api.py:186-194`

The queue is consumed once. A reconnect, a second tab, or a dev-mode double mount can miss events permanently. There is no event ID or sequence number, so `Last-Event-ID` cannot be supported.

**Impact:** The UI can hang in an intermediate state while the job is actually complete.

**Suggestion:** Persist an append-only event log per job, include monotonic event IDs, support `Last-Event-ID` replay, and allow multiple subscribers.

---

#### API-07 — SSE detail fields do not match the schemas (Medium)

**Where:** `api.py:115-126`

The API reads `reqs.required_skills` and `matched.missing_skills`; the schemas define `must_have_skills` and `gap_areas`. If the attributes are absent, `getattr(..., [])` returns an empty list.

**Impact:** The UI always reports zero required/missing skills, reducing the usefulness of the progress stream.

**Suggestion:** Use the actual schema fields and add a small payload test.

---

#### API-08 — No input length or rate limits (Medium)

**Where:** `api.py:48-49`, `159-163`

`jd_text` is unbounded. There is no rate limit, max body size, or concurrency cap.

**Impact:** A large paste or repeated requests can exhaust tokens, memory, or the LaTeX process. On a shared machine this is a denial-of-service vector.

**Suggestion:** Cap JD length (for example 20k characters), reject oversized requests with `413`, and add a simple per-IP/session rate limit.

---

#### API-09 — `BackgroundTasks` is not a job runner (Medium)

**Where:** `api.py:159-178`

The worker is attached to the request's background task. It works in a single-process local setup, but it is not durable, not observable, and not compatible with multiple workers.

**Impact:** Job execution is tied to the server process lifecycle and is hard to scale or recover.

**Suggestion:** Use a proper task queue or a persistent worker loop for anything beyond local demo use. At minimum, document single-worker mode and add a startup recovery path.

---

#### API-10 — Minor API issues (Low)

**Where:** `api.py`

- Job IDs are the first 8 hex characters of a UUID (`api.py:165`), with no collision check and limited entropy.
- There is no `GET /api/tailor/{job_id}` status/result endpoint, so the frontend cannot recover state after a reload.
- `/api/health` does not check the LLM endpoint or `pdflatex`.
- Logging and naming contain typos (`run_pipline_worker`, `"Tailoring pipline "`, malformed f-string at `api.py:112`).
- `Optional` is imported but unused.

**Suggestion:** Use full UUIDs, add a result endpoint, add dependency checks to health, and clean up naming/logging.

---

### 5.5 Frontend and product coherence (`FE`)

#### FE-01 — The frontend is split between demo data and the real backend (High)

**Where:** `frontend/package.json:1`, `frontend/src/store/AppContext.tsx:31-33`, `frontend/src/pages/NewApplication.tsx:16-37`

`package.json` still describes the app as "demo mode — simulated pipeline, no backend calls", while several screens now call the API. `AppContext` initializes with `demoApplications` and `demoProfile`, then replaces only the profile with the backend response.

**Impact:** Users see a mix of real and fictional data. The project's status is unclear to a reviewer, and behavior depends on whether the backend is running.

**Suggestion:** Choose one mode per screen and label it explicitly. Either finish the integration and remove demo data from real flows, or add a real `VITE_DEMO_MODE` switch. Update `package.json` and all badges.

---

#### FE-02 — Custom JDs display unrelated demo match data and score (High)

**Where:** `frontend/src/pages/MatchResults.tsx:29-34`

For a custom application (`jdId: "custom"`), `getJD` falls back to `sampleJDs[0]` and `matchData` falls back to `matchData["jd-frontend"]`.

**Impact:** After tailoring a resume for, say, a backend role, the results page shows a Frontend Engineer JD, fake skill bars, and a 92% score. This is the most visible correctness bug in the product.

**Suggestion:** Add a result endpoint and render the actual `JDRequirements`, `MatchedItems`, and `ResumeContent`. If a result is unavailable, show an explicit empty/error state instead of demo fallback data.

---

#### FE-03 — Demo application PDFs return the last global resume (High)

**Where:** `frontend/src/pages/MatchResults.tsx:33`, `frontend/src/pages/MatchResults.tsx:129`

The download/preview URL uses the application ID. For demo applications, that ID is not a backend job ID, so the API falls back to `output/resume.pdf` — whatever was generated last.

**Impact:** A resume is displayed/downloaded that does not correspond to the selected application. Combined with `API-03`, this also exposes the last user's resume.

**Suggestion:** Only show PDF actions for applications with a valid job ID; otherwise show "Generate resume". Remove the server fallback.

---

#### FE-04 — Pipeline stages describe a different product (Medium)

**Where:** `frontend/src/lib/pipeline.ts:17-73`, `frontend/src/components/PipelineRunner.tsx:26-37`

The five stages are "read JD → search portfolio → match → generate cover letter → proofread". The backend has six resume nodes: `read_jd → load_profile → match → generate_content → render → compile`. `load_profile` is mapped to stage 2 ("Matching skills"), and "proofread" never runs.

**Impact:** The progress UI is misleading: it claims a cover letter and proofreading that do not exist, and skips rendering/compilation as first-class stages.

**Suggestion:** Define stages from the actual graph: read JD, load profile, match, generate content, render LaTeX, compile PDF. Drive labels from the node names rather than a separate narrative.

---

#### FE-05 — SSE errors permanently close the stream (Medium)

**Where:** `frontend/src/components/PipelineRunner.tsx:45`

`sse.onerror = () => sse.close()` disables EventSource's automatic reconnect. There is no error state, retry, or user-visible message.

**Impact:** A transient network error or server restart leaves the UI stuck forever. The job may have completed on the server.

**Suggestion:** Show an error banner, retry with backoff, and recover job state via a status/result endpoint. Combine with SSE replay (`API-06`).

---

#### FE-06 — StrictMode double-mounts the SSE connection (Low)

**Where:** `frontend/src/main.tsx:9`, `frontend/src/components/PipelineRunner.tsx:17-47`

React StrictMode mounts effects twice in development. Because the job queue is single-consumer, the first connection can consume events before being closed, leaving the second connection without them.

**Impact:** Intermittent missing progress in development, which can be mistaken for a backend bug.

**Suggestion:** Make the stream replayable and idempotent; the double-connect then becomes harmless. Alternatively, guard the connection with a ref and document the behavior.

---

#### FE-07 — Backend URL is hardcoded in multiple files (Medium)

**Where:** `frontend/src/store/AppContext.tsx:38,58`, `frontend/src/pages/NewApplication.tsx:21`, `frontend/src/pages/MatchResults.tsx:33,129`, `frontend/src/components/PipelineRunner.tsx:20`

The URL `http://127.0.0.1:8000` is repeated in at least five places. Settings' "API base URL" field is not connected to any of them.

**Impact:** Changing the port, host, or deployment target requires code edits. The UI implies configurability that does not exist.

**Suggestion:** Add `src/lib/api.ts` with `const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"` and route every call through it.

---

#### FE-08 — No error UI for backend failures (Medium)

**Where:** `frontend/src/pages/NewApplication.tsx:20-37`

If `POST /api/tailor` fails, the error is logged to the console and `loading` is reset; the user remains on the input screen with no explanation. The profile fetch in `AppContext` behaves similarly.

**Impact:** The app appears unresponsive when the backend is down or returns a validation error.

**Suggestion:** Add an error banner/toast with the server's `detail`, a retry action, and a link to diagnostics.

---

#### FE-09 — No persistence for applications (High)

**Where:** `frontend/src/store/AppContext.tsx:31-33`, `80-101`

Applications live in React state only. Refresh or navigation remounts the provider and restores `demoApplications`. There is no backend applications API.

**Impact:** A user loses every created application on refresh; the dashboard and history are not trustworthy.

**Suggestion:** Persist applications in the backend (SQLite is sufficient) or at least `localStorage` for demo mode. Add `GET/POST/PATCH/DELETE /api/applications`.

---

#### FE-10 — Real JD title/company are discarded (Medium)

**Where:** `frontend/src/pages/NewApplication.tsx:28`

The application is created as `"Target Role"` / `"Company"` instead of using the extracted JD title and company. The backend extracts them but the SSE payload exposes only counts.

**Impact:** The dashboard, applications list, and match page all display placeholders, even after a successful extraction.

**Suggestion:** Return `job_title` and `company` in the SSE `read_jd` event (or a result endpoint) and update the application record.

---

#### FE-11 — Settings is largely decorative (Medium)

**Where:** `frontend/src/pages/Settings.tsx:56-60`, `115-117`, `131-187`

"Save settings" only shows a toast; API base URL and model tier are not wired; the preferences toggles have no effect beyond local state.

**Impact:** Users cannot configure the things the UI suggests they can. The "Saved" message is misleading.

**Suggestion:** Wire the fields to real configuration or label the section "Demo / coming soon" and remove the save affordance.

---

#### FE-12 — Cover-letter editor is fully demo and still linked (Medium)

**Where:** `frontend/src/pages/LetterEditor.tsx:13`, `48`, `83-94`

The editor uses static `letterBodies` from `demo.ts`, simulates regeneration with a timer, and has no backend counterpart.

**Impact:** The product appears to offer cover-letter generation while the backend does not. The landing page and README describe different products.

**Suggestion:** Decide whether cover letters are in scope. If not, remove the route and links. If yes, implement a real generation endpoint and document it.

---

#### FE-13 — There is no API for real results (Medium)

**Where:** `api.py` (endpoints), `frontend/src/pages/MatchResults.tsx`

The backend exposes only profile, job start, SSE, PDF, and health. It does not expose the extracted JD, match data, or generated resume content. The frontend therefore cannot render real results even if it wanted to.

**Impact:** The UI is forced into demo fallbacks, which is the root cause of `FE-02`.

**Suggestion:** Add `GET /api/tailor/{job_id}/result` returning the job status, JD requirements, matched items, generated content (safe subset), and PDF URL.

---

#### FE-14 — Minor frontend issues (Low)

- `Dashboard` mixes a real profile name with fictional applications (`Dashboard.tsx:42-53`).
- `Portfolio.tsx` is ~32 KB and `Landing.tsx` ~34 KB; both should be split into components.
- `Portfolio.tsx:111` uses `alert()` for import errors; use the UI's notification pattern.
- `demo.ts` keeps both legacy (`title`, `organization`, `startDate`, `skillsUsed`) and current (`role`, `company`, `date`, `skills`) fields, increasing the chance of divergent shapes.
- `PipelineRunner` schedules `setTimeout(onComplete, 800)` inside an SSE handler without clearing it on unmount (`PipelineRunner.tsx:42`).
- The initial demo profile can flash before the backend profile loads; `isLoadingProfile` is only partially used.

**Suggestion:** Split large pages, standardize on one profile shape, replace `alert`, and clear timers on cleanup.

---

### 5.6 LaTeX and output quality (`TEX`)

#### TEX-01 — The generated resume is two pages with no page budget (High)

**Where:** `output/resume.log:436`

The existing build says `Output written on ... resume.pdf (2 pages, 119637 bytes)`. The README previously called the output "publication-ready".

**Impact:** Two-page resumes are often filtered or penalized, especially for early-career candidates. The project has no page-count check or trimming logic.

**Suggestion:** Measure the page count after compilation. If it exceeds one page, trim low-relevance bullets, tighten spacing, or switch to a compact template; recompile automatically. Enforce a configurable page budget.

---

#### TEX-02 — Project headings produce severe overfull boxes (High)

**Where:** `output/resume.log:382-399`, `output/resume.tex:208,224,240`, `templates/resume_template.tex.jinja:73-78`

The log reports overfull `\hbox` values of 124.57pt, 85.32pt, and 25.02pt in the project headings. The heading uses a non-wrapping `tabular*` with a long tech-stack string.

**Impact:** Text can run into the margin or overlap the date column, which looks unpolished and can hurt ATS extraction.

**Suggestion:** Replace the tabular heading with a wrappable layout (for example a `minipage` or `tabularx` with `X` columns), shorten the tech string, or allow it to wrap under the project name. Add a build check that fails on overfull boxes above a small threshold.

---

#### TEX-03 — Optional personal fields render as `None` (Medium)

**Where:** `templates/resume_template.tex.jinja:96-102`

`{{ personal_info.location }}` and `{{ personal_info.phone }}` render the Python string `None` when the fields are absent. Only the experience/education templates use `or ''`.

**Impact:** A partial profile produces a resume header containing "None".

**Suggestion:** Use `{{ personal_info.location or '' }}` and `{{ personal_info.phone or '' }}`, or normalize the values before rendering.

---

#### TEX-04 — Link handling is fragile (Medium)

**Where:** `templates/resume_template.tex.jinja:100`

The template hardcodes `https://{{ link }}`. If a profile link already includes a scheme, the output becomes `https://https://...`. Separately, `_escape_latex` escapes underscores inside the `\href` URL, which can break links that contain them.

**Impact:** Broken hyperlinks and odd display text.

**Suggestion:** Store normalized URLs (scheme + host + path) in the profile, validate them, and use `\url{}`/`\href{}` with a dedicated URL escaper. Add tests for `https://`, bare domains, and underscores.

---

#### TEX-05 — No page-break control or section hygiene (Medium)

**Where:** `templates/resume_template.tex.jinja:105-195`

Sections can split awkwardly across pages. There is no `\needspace`, `\nopagebreak`, or orphan control.

**Impact:** Even at two pages, the layout can look accidental.

**Suggestion:** Add section-level page-break rules and test with long and short profiles.

---

#### TEX-06 — No ATS text-extraction verification (Medium)

**Where:** `nodes/compile.py`

The project claims ATS optimization but never verifies that the PDF text extracts cleanly. There is no `pdftotext` check for garbled ligatures, missing spaces, or lost section headings.

**Impact:** A visually correct PDF can still be unreadable to an ATS.

**Suggestion:** After compilation, run `pdftotext` and assert that expected headings, name, email, and key skills appear. Add this to CI once a test suite exists.

---

#### TEX-07 — Minor template issues (Low)

- `render.py:86-91` checks `isinstance(content["skills_section"], dict)`, but `skills_section` is a list of `SkillCategory` objects after `model_dump()`. The branch is dead code.
- The template supports both list and mapping forms for skills, which adds complexity for no current benefit.
- There is no `\usepackage[T1]{fontenc}`; Latin-1 coverage is usually fine with modern LaTeX, but non-Latin names/scripts are unsupported.
- No PDF metadata (title/author) is set.

**Suggestion:** Remove the dead branch, standardize on the list shape, decide on font encoding/non-Latin support, and set `\hypersetup{pdftitle=..., pdfauthor=...}`.

---

### 5.7 Repository, setup, and documentation (`REPO`)

#### REPO-01 — No dependency file (High)

`requirements.txt`, `pyproject.toml`, `setup.py`, `uv.lock`, and `poetry.lock` are all absent. The README previously referenced `requirements.txt`, but it does not exist.

**Impact:** A clean machine cannot reproduce the environment; versions drift; onboarding is guesswork.

**Suggestion:** Add `requirements.txt` (or preferably `pyproject.toml` with pinned versions) and document the Python version. Include `fastapi`, `uvicorn`, `sse-starlette`, `pydantic`, `email-validator`, `python-dotenv`, `jinja2`, `langgraph`, `langchain`, `langchain-openai`, and `httpx`.

---

#### REPO-02 — The README install command omitted required packages (High)

The previous command (`pip install langgraph langchain langchain-openai pydantic python-dotenv jinja2 fastapi uvicorn httpx`) omitted `sse-starlette` (imported by `api.py`) and `email-validator` (required by `EmailStr`). The README has been corrected in this pass; the dependency file still needs to be added.

**Impact:** Following the old instructions produced an import error on startup.

**Suggestion:** Keep the README command and the dependency file in sync; add a CI job that installs from the file in a clean environment.

---

#### REPO-03 — `.env.example` does not match the code or the README (High)

**Where:** `.env.example:1-15`

The example contains `LANGSMITH_*`, `OPENCODE_*`, and `GEMMA_*` variables, but no `OPENAI_API_KEY`, `CLOUD_ENDPOINT`, or `OPENAI_MODEL`, which the old README told users to set. `OPENCODE_PROXY_URL=http://127.0.0.1:8000/v1` also collides with the FastAPI port used by the project.

**Impact:** A new user following the docs cannot configure the app; the proxy URL points at the API server itself.

**Suggestion:** Rewrite `.env.example` to match the actual lookup order, remove or clearly separate experimental `OPENCODE_*` variables, and choose a non-conflicting proxy port.

---

#### REPO-04 — `config.py` is dead code (Medium)

**Where:** `config.py:1-19`

Nothing imports `config.py`. Model selection is duplicated in `nodes/read_jd.py` and `nodes/generate_content.py`.

**Impact:** Two configuration stories exist; one is misleading and can drift.

**Suggestion:** Either use `config.py` as the single settings source (preferred) or delete it. Add a `Settings` model and validate at startup.

---

#### REPO-05 — `run.py` is a placeholder (Medium)

**Where:** `run.py:1-8`

The file is named as the CLI entrypoint and the spec calls for a CLI, but it contains only `pass`.

**Impact:** Users cannot run the pipeline from the command line, and the repository implies functionality that does not exist.

**Suggestion:** Implement a small CLI (`python run.py --jd jd.txt --profile master_profile.json --out output/`) or remove the file and update the spec/README.

---

#### REPO-06 — `test.py` is a stale duplicate, not a test suite (Medium)

**Where:** `test.py:118-377`

The file duplicates most of `api.py` (including a second `FastAPI` app and endpoint definitions) after 117 lines of commented experiments. It has already diverged: it uses `run_pipeline_worker` (vs `run_pipline_worker`) and emits `"complete"` (vs `"completed"`).

**Impact:** Running it starts a second server; maintaining it doubles API work; it creates false confidence that tests exist.

**Suggestion:** Delete it or split the commented experiments into `scripts/`. Add a real `tests/` suite with `pytest` and `httpx.AsyncClient`.

---

#### REPO-07 — No automated tests or CI (High)

There are no unit, integration, or end-to-end tests, and no CI workflow. LaTeX escaping, matching, schema round-trips, SSE behavior, and API error paths are untested.

**Impact:** Every change is verified manually against one happy path. Regressions in the trust-critical paths are likely.

**Suggestion:** Add `pytest` with tests for:
- `_escape_latex` and recursive escaping;
- `match` aliases/weights/projects;
- `CandidateProfile` round-trip and alias handling;
- API job lifecycle with a fake graph;
- template rendering against a golden `.tex` file;
- a `pdftotext` ATS smoke test.

Add a GitHub Actions workflow for backend tests and `npm run build`.

---

#### REPO-08 — `Docs/BUILD_LOG.md` is stale (Medium)

**Where:** `Docs/BUILD_LOG.md:13-28`, `65-78`, `107-113`

The log says the pipeline uses Tectonic (the code uses `pdflatex`), describes `match` as a local LLM call (it is deterministic Python), and leaves most checklist items unchecked despite the implementation existing.

**Impact:** The document contradicts the code and misleads contributors.

**Suggestion:** Update it to reflect the actual six-node pipeline, `pdflatex`, deterministic matching, and current status. Keep it as a living log or archive it.

---

#### REPO-09 — No `LICENSE` file (Low)

The README says "MIT License", but no `LICENSE` file exists.

**Suggestion:** Add the standard MIT license text with the correct copyright holder.

---

#### REPO-10 — Stale git worktree (Low)

`git worktree list` shows `.kilo/worktrees/incongruous-decision` at commit `c27b710` (detached HEAD), containing an older profile and an `opencode_proxy.py` not present in `main`.

**Impact:** Confusing workspace state and potential divergence.

**Suggestion:** Remove the worktree if it is no longer needed (`git worktree remove ...`) or document its purpose.

---

#### REPO-11 — No linting/formatting/type-checking configuration (Low)

There is no `ruff`, `black`, `mypy`, `eslint`, or `prettier` configuration. Node functions are untyped (`async def read_jd(state)`), and naming/formatting is inconsistent (`run_pipline_worker`, mixed tag capitalization, uneven spacing).

**Impact:** Style drift and easy-to-miss errors; harder reviews.

**Suggestion:** Add `ruff` + `black` (or `ruff format`) and `mypy` for Python, `eslint` + `prettier` for the frontend, and type the node signatures as `ResumeAgentState -> dict`.

---

## 6. Cross-cutting root causes

1. **The project evolved from a cover-letter demo into a resume agent without finishing the migration.** The landing page, pipeline labels, `package.json`, `demo.ts`, and README describe the old product; the backend and parts of `/app/new` implement the new one.
2. **The trust guarantee was treated as prompt engineering rather than an invariant.** The output schema and graph do not enforce provenance, so prompt drift becomes a product defect.
3. **Job execution was designed for one local user and one run at a time.** Shared output paths, in-memory jobs, and single-consumer SSE all stem from that assumption.
4. **Documentation was written ahead of implementation.** The README and BUILD_LOG describe capabilities that do not exist yet, which makes the project look less credible than the code actually is.
5. **There is no automated feedback loop.** Without tests, each fix risks breaking the happy path, so the team is reluctant to refactor.

---

## 7. Prioritized roadmap

### P0 — Do before sharing or deploying (1–3 days)

1. **Fix the trust contract** (`GRD-01`, `GRD-02`, `GRD-03`, `GRD-04`):
   - change generation output to source IDs + bullets only;
   - join profile facts deterministically;
   - add a verifier with entity/metric locking;
   - add a regression test using the Terraform/throughput example.
2. **Stop the PDF leak** (`API-03`): return `404` for unknown/invalid jobs; remove the global fallback.
3. **Protect the local API** (`API-04`, `API-05`): allowlist the frontend origin, add a token, write the profile atomically, keep a backup.
4. **Isolate job output** (`API-02`): one directory per job.
5. **Make the README truthful** — done in this pass; keep it updated.

### P1 — Make the core workflow reliable (3–7 days)

1. **Rewrite matching** (`MAT-01`–`MAT-06`): aliases, taxonomy, weighting, projects, structured results.
2. **Fix pipeline error handling** (`PIPE-01`, `PIPE-02`, `PIPE-06`): conditional failure routing, original error messages, UTF-8 validation.
3. **Fix configuration and startup** (`PIPE-03`, `PIPE-04`, `REPO-01`–`REPO-04`): settings module, lazy clients, explicit API mode, dependency file, updated `.env.example`.
4. **Add SSE replay and job state** (`API-01`, `API-06`): event log with IDs, status/result endpoint, TTL cleanup.
5. **Fix the visible frontend lies** (`FE-02`, `FE-03`, `FE-04`, `FE-08`, `FE-10`): real results for custom JDs, correct stage labels, error UI, extracted role/company.

### P2 — Complete the product (1–2 weeks)

1. **Finish frontend integration** (`FE-01`, `FE-07`, `FE-09`, `FE-11`–`FE-13`):
   - central API client and `VITE_API_BASE_URL`;
   - persistent applications;
   - real result page;
   - remove or complete cover-letter flows;
   - wire Settings.
2. **Harden PDF output** (`TEX-01`–`TEX-06`):
   - one-page budget;
   - overflow-free project headings;
   - optional fields;
   - URL handling;
   - `pdftotext` verification.
3. **Add tests and CI** (`REPO-07`): the test list in section 8.
4. **Clean up the repo** (`REPO-05`, `REPO-06`, `REPO-08`–`REPO-11`): CLI or remove `run.py`, delete `test.py`, refresh BUILD_LOG, add LICENSE, remove the stale worktree, add lint config.

### P3 — Polish and scale

1. Persistent database for applications and jobs.
2. Multi-template support and template selection.
3. Page-count/layout auto-tuning.
4. Docker image and a deployment story.
5. Rate limiting, structured logging, metrics, and tracing.

---

## 8. Recommended test plan

### Backend unit tests

| Area | Tests |
|---|---|
| LaTeX escaping | Smart quotes, en/em dashes, `& % $ # _ { } ~ ^ \`, narrow spaces, backslashes, `__init__`, Markdown bold. |
| Profile validation | Missing required fields, legacy aliases (`dates`/`school`), extra fields, UTF-8 content, invalid email. |
| Matching | Exact match, aliases (`Postgres`/`PostgreSQL`), false-positive substrings (`Go` vs `Google`), must-have vs nice-to-have weighting, projects, gaps. |
| Generation contract | Mock LLM returns an unknown company/metric → verifier rejects; source IDs preserved. |
| Rendering | Golden `.tex` output for a fixed profile; optional fields render empty, not `None`; links with and without schemes. |
| Compilation | `pdflatex` failure surfaces a clear error; missing executable message; one-page budget. |

### API integration tests

- Start a job, consume the SSE stream, assert the event order and final `pdf_url`.
- Unknown job ID returns `404` (not the last PDF).
- Two concurrent jobs produce two distinct PDFs.
- Profile POST rejects invalid JSON and does not corrupt the existing file.
- CORS rejects a disallowed origin.
- SSE reconnect with `Last-Event-ID` replays missed events.

### Frontend tests

- Custom application displays the real JD/score, not the frontend sample.
- Backend-offline state renders an error and retry action.
- Pipeline stage labels match the backend nodes.
- Refresh preserves applications.
- PDF button is disabled for applications without a job ID.

### End-to-end smoke test

1. Start with a clean venv and install from the dependency file.
2. Start the API and frontend.
3. Paste a JD, run the pipeline, confirm the SSE events and PDF.
4. Run `pdftotext` and assert expected headings/name/email/skills.
5. Confirm the PDF is one page and has no overfull boxes above the threshold.

---

## 9. Quick wins (under one day)

- Remove the PDF fallback (`api.py:196-219`).
- Fix SSE detail field names (`api.py:115-126`).
- Allowlist CORS origins and disable credentials with a wildcard.
- Make profile writes atomic and add `master_profile.backup.json`.
- Add `requirements.txt`/`pyproject.toml`.
- Rewrite `.env.example` to match the code.
- Delete `test.py` (or move experiments to `scripts/`).
- Add `LICENSE`.
- Add `encoding="utf-8"` to `load_profile`.
- Use `or ''` for optional personal fields in the template.
- Replace the project-heading layout with a wrappable one.
- Add a `GET /api/tailor/{job_id}` status endpoint.
- Add `VITE_API_BASE_URL` and a single API client.
- Update `package.json`, `BUILD_LOG.md`, and `Docs/` to match reality.

---

## 10. Acceptance criteria for "trust-first v1"

The project can credibly claim the trust guarantee when all of the following are true:

1. Every generated bullet carries a `source_reference` to a profile entry.
2. No company, role, date, institution, degree, tool, or numeric metric can appear in the output unless it exists in the referenced source (or is explicitly declared as a cross-entry skill).
3. An adversarial JD prompt-injection test cannot add a fabricated claim.
4. Two concurrent users/jobs receive two distinct PDFs.
5. An unknown job ID returns `404`, never another user's PDF.
6. A crash during profile save cannot destroy the previous profile.
7. A clean environment can install and run from documented commands.
8. The generated PDF is one page, has no overfull boxes above the threshold, and passes a `pdftotext` smoke test.
9. The frontend shows real JD/match/resume data for a custom application and clear error states when the backend is unavailable.
10. CI runs backend tests, frontend type-check/build, and the ATS smoke test on every push.

---

## 11. Evidence appendix

The findings above were verified against the following artifacts:

- `README.md` (pre-update claims)
- `api.py` (endpoints, jobs, SSE, PDF fallback, CORS)
- `graph.py`, `state.py`
- `nodes/read_jd.py`, `load_profile.py`, `match.py`, `generate_content.py`, `render.py`, `compile.py`
- `schemas/candidate_profile.py`, `jd_requirements.py`, `matched_items.py`, `resume_content.py`
- `templates/resume_template.tex.jinja`
- `output/resume.tex`, `output/resume.pdf`, `output/resume.log`
- `frontend/package.json`, `frontend/src/**`
- `.env.example`, `.gitignore`, `config.py`, `run.py`, `test.py`
- `Docs/BUILD_LOG.md`, `Docs/resume_agent_spec_v1.md`, `Docs/industry_grade_resume_agent_blueprint.md`
- Git metadata (`git log`, `git ls-files`, `git worktree list`)

Key concrete evidence:

- `output/resume.log:436` — `Output written on ... resume.pdf (2 pages, 119637 bytes)`.
- `output/resume.log:382-399` — overfull hboxes of 124.57pt, 85.32pt, and 25.02pt.
- `output/resume.tex:148-160` — Terraform/throughput bullets in the CloudScale entry.
- `master_profile.json:287` — Terraform appears only in the flat skills list.
- `api.py:115-126` — `required_skills` / `missing_skills` mismatch.
- `api.py:196-219` — global PDF fallback.
- `frontend/src/pages/MatchResults.tsx:29-34` — demo JD/match fallback for custom jobs.
- `frontend/src/lib/pipeline.ts:17-73` — cover-letter stage model.
- `frontend/package.json:1` — "no backend calls" description.
- `test.py:118-377` — duplicate FastAPI app, not tests.

---

## 12. Sign-off

The project has good bones: a clean graph, typed data, thoughtful LaTeX handling, and a strong UI. The remaining work is mostly about **making the promises true** — grounding, matching, isolation, and product coherence — rather than rewriting the architecture.

The fastest path to a credible v1 is: fix the trust contract, remove the PDF fallback, isolate job output, tell the truth in the UI/docs, and add tests around those invariants. Everything else can follow.
