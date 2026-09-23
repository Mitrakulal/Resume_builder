# Industry-Grade Resume Agent Blueprint & Product Specification

**Document Purpose:** This document outlines the product architecture, data schemas, verification mechanisms, and feature roadmap required to elevate the Resume Agent from a developer prototype to an industry-grade, enterprise-ready, trust-first resume intelligence platform.

---

## 1. Executive Summary

Most generative AI resume builders suffer from two fatal flaws:
1. **Hallucination & Fabrication:** Inventing metrics, employment dates, or unverified skills that fail technical and behavioral interviews.
2. **Shallow Data Intake:** Treating candidate experience as unstructured paragraphs rather than structured, atomic facts.

The **Resume Agent** solves this through a **factuality-first architecture**:
* A single, immutable **Candidate Master Profile** as the source of truth.
* Deterministic mathematical skill matching and strict entity linking.
* Programmatic audit trails connecting every tailored bullet to a verified experience record.
* Clean, ATS-optimized LaTeX PDF compilation with zero manual design friction.

---

## 2. Comprehensive Candidate Profile Schema Architecture

To eliminate information gaps, the profile schema must be expanded beyond basic contact info into a rich, structured dataset:

### 2.1 Digital Footprint & Identification
* **Target Professional Title:** e.g., *"Staff Backend Engineer"*, *"Platform Engineer"*.
* **Location & Work Authorization:** City, State/Country, Remote preference, and Visa/Citizenship work authorization status.
* **Profiles & Public Presence:**
  * LinkedIn URL
  * GitHub URL
  * Portfolio / Personal Site
  * Technical Blog / Substack / Medium

### 2.2 Granular Experience (The Google XYZ Formula)
Rather than loose summary text, each work experience record must store atomic achievements structured around the **XYZ Formula**: 
> *"Accomplished [X], as measured by [Y], by doing [Z]"*

```json
{
  "id": "exp_01",
  "company": "Northstar Labs",
  "role": "Senior Backend Developer",
  "location": "Austin, TX (Remote)",
  "employment_type": "Full-time",
  "start_date": "2022-03",
  "end_date": null,
  "is_current": true,
  "bullets": [
    {
      "id": "b_01",
      "text": "Architected asynchronous FastAPI microservices, reducing p95 latency by 35% across 2M daily operations.",
      "skills_used": ["Python", "FastAPI", "PostgreSQL", "Redis"],
      "impact_metric": "35% latency reduction",
      "category": "Architecture & Performance"
    }
  ]
}
```

### 2.3 Dedicated Projects Section (Critical for Engineering Roles)
* **Project Name & Role** (Creator, Core Contributor).
* **Source Repository URL & Live Production URL**.
* **Tech Stack Matrix:** Languages, frameworks, and deployment infrastructure.
* **Key Technical Highlights:** Measurable architectural or algorithmic outcomes.

### 2.4 Categorized Skills Matrix (ATS-Friendly)
Recruiters and ATS parsers penalize flat lists of 40 mixed keywords. Skills must be grouped into distinct taxonomy buckets:
* **Languages:** Python, Go, TypeScript, SQL.
* **Frameworks & Libraries:** FastAPI, Django, React, Pytest.
* **Databases & Caching:** PostgreSQL, Redis, MongoDB.
* **DevOps & Cloud Infrastructure:** Docker, Kubernetes, AWS, GitHub Actions, Linux.
* **Core Methodologies:** Microservices, Distributed Systems, CI/CD, REST APIs.

### 2.5 Education, Credentials & Extracurriculars
* **Education:** Degree, Major, Institution, Graduation Year, Honors/GPA.
* **Certifications:** Issuing Organization, Credential ID, Verification Link, Issue/Expiry Dates.
* **Patents, Publications & Open Source:** Maintainer status, citations, conference talks.

---

## 3. Onboarding & Data Ingestion Workflows

To prevent user drop-off during profile creation, the platform employs a three-tier intake pipeline:

```
[Old Resume PDF / DOCX] ──> [Document AI Extractor] ──┐
                                                      │
[LinkedIn Archive .ZIP]  ──> [CSV Data Parser]       ──┼──> [CandidateProfile Pydantic Validator]
                                                      │
[Interactive Q&A Agent]  ──> [XYZ Metric Interviewer] ──┘
```

1. **Resume Parser (PDF/DOCX Upload):** Optical and structural extraction into the `CandidateProfile` Pydantic model with confidence scores for user review.
2. **LinkedIn Archive Import:** Direct ingest of LinkedIn export `.zip` files (guaranteeing exact employment dates, titles, and verified credentials).
3. **Conversational "Experience Interviewer" Agent:** For vague entries (e.g., *"Worked on backend APIs"*), an AI copilot prompts: *"What framework did you use? What was the request scale or latency impact?"* converting weak bullets into quantified achievements before tailoring begins.

---

## 4. Factuality Guarantee & Anti-Hallucination Architecture

Trust is the single most valuable asset of an AI career tool. The platform enforces factuality via programmatic constraints, not just prompt guidelines:

### 4.1 Bullet-Level Audit Trail
Every generated bullet point carries an immutable provenance link pointing to the exact line in `master_profile.json` from which it was synthesized:
```json
{
  "tailored_bullet": "Engineered high-throughput FastAPI endpoints at Acme Corp...",
  "source_reference": "experience[0].bullets[0]",
  "verified_grounded": true,
  "metrics_preserved": ["35% latency reduction"]
}
```

### 4.2 Metric & Entity Locking
* The agent is strictly forbidden from generating numeric percentages, dollar amounts, or time savings that were not explicitly declared in the master profile.
* Any metric in the output must match a recognized token from the candidate's input.

### 4.3 Programmatic Verification Node (`verify_groundedness`)
An automated LangGraph node runs after `generate_content`:
* Extracts named entities (tools, libraries, companies, numbers).
* Asserts that every entity exists in the `CandidateProfile` set.
* Halts compilation and triggers regeneration if any hallucinated entity is detected.

---

## 5. ATS Compatibility & Dynamic LaTeX Engine

### 5.1 ATS Compatibility Standards
* **Single-Column Semantic Typography:** Eliminates complex multicolumn floats that break text flow in legacy enterprise ATS parsers.
* **Standardized Heading Hierarchies:** Strict adherence to universally recognized section names (`Professional Summary`, `Work Experience`, `Education`, `Technical Skills`).
* **Text Extraction Verification:** Automated subprocess testing verifying that `pdftotext` extracts 100% readable ASCII/UTF-8 text without corrupted ligature symbols.
* **Dual Output Support:** Generating compiled PDF and clean plaintext/DOCX alternatives for portals requiring non-PDF uploads.

### 5.2 Dynamic Page Budget Enforcement
* A resume running 1.1 pages looks unpolished.
* The compilation node measures the resulting page count. If the document spills onto page 2:
  * Adjusts vertical spacing macros (`\itemsep`, `\vspace`).
  * Trims secondary bullet points based on JD relevance scores.
  * Recompiles automatically to enforce a crisp, exact 1-page fit.

---

## 6. Application Lifecycle & Multi-Target Versioning

A professional candidate does not have "one" resume—they maintain one source of truth mapped to multiple job applications:

* **One Master Profile -> Many Tailored Applications:**
  * `master_profile.json` remains the global fact repository.
  * Each job application creates an isolated record containing the target JD, relevance match analytics, tailored bullet adjustments, and compiled PDF artifact.
* **Application Tracker Integration:**
  * Tracks application status: `Draft` -> `Applied` -> `Interview` -> `Offer` -> `Archived`.
  * Allows re-opening, inspecting, and regenerating previous versions when scheduled for an interview.

---

## 7. Capability Comparison Matrix

| Feature Area | Current Baseline Implementation | Industry-Grade Target Architecture |
|---|---|---|
| **Candidate Profile** | Flat skills, single summary string | Structured XYZ metrics, projects, categorized skills, online credentials |
| **Intake Method** | Manual JSON file edit | PDF/LinkedIn ingestion + conversational metric interviewer |
| **Skill Matching** | Case-insensitive exact string match | Semantic embeddings + taxonomy hierarchy + provenance tracking |
| **Factuality Guarantee** | Negative prompt instruction | Programmatic entity-linking verification node + metric locking |
| **Document Layout** | Single fixed article LaTeX template | Multi-template library + dynamic 1-page budget auto-adjustment |
| **Application Lifecycle** | Overwrites `output/resume.pdf` | Versioned application database with tracking and history audit |
| **Frontend Experience** | Command-line / test runner | Linear-style neutral SaaS workspace with split-screen live preview |
