import React, { useState, useMemo } from "react";
import {
  FileText,
  LayoutDashboard,
  Sparkles,
  User,
  Briefcase,
  Layers,
  Settings,
  Download,
  Code2,
  History,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  ShieldCheck,
  UploadCloud,
  FileCheck,
  Play,
  Check
} from "lucide-react";
import {
  INITIAL_PROFILE,
  INITIAL_APPLICATIONS,
  TEMPLATES_GALLERY,
  PIPELINE_STAGES,
  buildLatexDocument,
} from "./mockData";
import type {
  CandidateProfile,
  ApplicationRecord,
  PipelineStage,
} from "./mockData";

export const App: React.FC = () => {
  // Navigation
  const [activeScreen, setActiveScreen] = useState<
    "tailor" | "dashboard" | "profile" | "applications" | "templates" | "settings"
  >("tailor");

  // Profile State
  const [profile, setProfile] = useState<CandidateProfile>(INITIAL_PROFILE);
  const [newSkill, setNewSkill] = useState("");
  const [profileTab, setProfileTab] = useState<"form" | "json">("form");

  // Tailor Resume State
  const [jobTitle, setJobTitle] = useState("Backend Developer");
  const [company, setCompany] = useState("Acme Corp");
  const [jdText, setJdText] = useState(
    "We are looking for a Python backend developer. Required skills include Python and REST APIs. Experience with FastAPI is preferred. Candidates should be comfortable with containerization and writing testable microservices."
  );
  const [isJdExpanded, setIsJdExpanded] = useState(false);
  const [pipeline, setPipeline] = useState<PipelineStage[]>(PIPELINE_STAGES);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rightPaneView, setRightPaneView] = useState<"preview" | "latex" | "history">("preview");
  const [selectedTemplateId, setSelectedTemplateId] = useState("article-standard");

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Teal-inspired Selective Bullet Toggle State
  const initialAvailableBullets = useMemo(() => {
    return [
      {
        id: "b1",
        text: "Architected high-throughput FastAPI REST API endpoints reducing p95 latency by 35%.",
        source: "Acme Corp (2022 - Present)",
        skills: ["FastAPI", "Python", "REST APIs"],
        active: true,
      },
      {
        id: "b2",
        text: "Engineered automated Pytest test suites achieving 92% coverage across critical business transactions.",
        source: "Acme Corp (2022 - Present)",
        skills: ["Pytest", "Python"],
        active: true,
      },
      {
        id: "b3",
        text: "Containerized legacy Python services with Docker and standardized deployment pipelines.",
        source: "Acme Corp (2022 - Present)",
        skills: ["Docker", "Linux"],
        active: true,
      },
      {
        id: "b4",
        text: "Implemented RESTful endpoints with Flask and optimized PostgreSQL database queries.",
        source: "Cedar Systems (2021 - 2022)",
        skills: ["Flask", "PostgreSQL", "SQL"],
        active: false,
      },
      {
        id: "b5",
        text: "Built frontend telemetry interfaces using React to visualize real-time microservice health.",
        source: "Cedar Systems (2021 - 2022)",
        skills: ["React"],
        active: false,
      }
    ];
  }, []);

  const [availableBullets, setAvailableBullets] = useState(initialAvailableBullets);

  // Applications Tracker State
  const [applications, setApplications] = useState<ApplicationRecord[]>(INITIAL_APPLICATIONS);

  // Settings State
  const [modelTier, setModelTier] = useState("gemma-local");
  const [endpointUrl, setEndpointUrl] = useState("http://127.0.0.1:8787/v1");
  const [strictFactuality, setStrictFactuality] = useState(true);

  // Onboarding Modal
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Target Skills for this job
  const targetJobSkills = useMemo(() => {
    return ["Python", "FastAPI", "REST APIs", "React", "Kubernetes", "AWS"];
  }, []);

  // Dynamic Skill Math
  const { matchedSkills, gapSkills, matchScore } = useMemo(() => {
    const candidateNorm = new Set(profile.skills.map((s) => s.trim().toLowerCase()));
    const matched = targetJobSkills.filter((s) => candidateNorm.has(s.trim().toLowerCase()));
    const gaps = targetJobSkills.filter((s) => !candidateNorm.has(s.trim().toLowerCase()));
    const score = Math.round((matched.length / Math.max(targetJobSkills.length, 1)) * 100);
    return { matchedSkills: matched, gapSkills: gaps, matchScore: score };
  }, [profile.skills, targetJobSkills]);

  // Active bullets rendered in document
  const activeBullets = useMemo(() => {
    return availableBullets.filter((b) => b.active).map((b) => b.text);
  }, [availableBullets]);

  // Toggle bullet inclusion
  const handleToggleBullet = (id: string) => {
    setAvailableBullets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
  };

  // Quick-Add Gap Skill to Profile (Teal Pattern)
  const handleQuickAddGap = (skill: string) => {
    if (profile.skills.includes(skill)) return;
    const updatedSkills = [...profile.skills, skill];
    setProfile({ ...profile, skills: updatedSkills });
    
    // Show Toast
    setToastMessage(`Added "${skill}" to master profile. Match score increased!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Run Pipeline Simulation
  const handleRunPipeline = () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const stages: PipelineStage["id"][] = ["read_jd", "match", "generate", "compile"];
    let currentIdx = 0;

    setPipeline((prev) =>
      prev.map((s) => ({ ...s, status: "idle" }))
    );

    const advance = () => {
      if (currentIdx >= stages.length) {
        setIsProcessing(false);
        setToastMessage("Pipeline complete: resume compiled and verified against master profile.");
        setTimeout(() => setToastMessage(null), 4000);
        return;
      }

      setPipeline((prev) =>
        prev.map((s, idx) =>
          idx === currentIdx
            ? { ...s, status: "running" }
            : idx < currentIdx
            ? { ...s, status: "completed" }
            : { ...s, status: "idle" }
        )
      );

      setTimeout(() => {
        setPipeline((prev) =>
          prev.map((s, idx) =>
            idx === currentIdx ? { ...s, status: "completed" } : s
          )
        );
        currentIdx += 1;
        advance();
      }, 700);
    };

    advance();
  };

  // Add / remove skill from master profile
  const handleAddSkill = () => {
    if (!newSkill.trim() || profile.skills.includes(newSkill.trim())) return;
    setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
    setNewSkill("");
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) });
  };

  // Change Application Status (CRM Pattern)
  const handleCycleAppStatus = (appId: string) => {
    const statuses: ApplicationRecord["status"][] = ["Draft", "Applied", "Interview", "Offer", "Rejected"];
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        const currentIdx = statuses.indexOf(app.status);
        const nextStatus = statuses[(currentIdx + 1) % statuses.length];
        return { ...app, status: nextStatus };
      })
    );
  };

  // Print/Download
  const handleDownload = () => {
    window.print();
  };

  const latexCode = buildLatexDocument(
    profile,
    profile.professional_summary,
    activeBullets
  );

  return (
    <div className="app-shell">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-bar">
          <Check size={14} color="#60a5fa" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-icon">
            <FileText size={16} />
          </div>
          <div className="brand-name">
            Resume<br />Agent
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeScreen === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveScreen("dashboard")}
          >
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${activeScreen === "tailor" ? "active" : ""}`}
            onClick={() => setActiveScreen("tailor")}
          >
            <Sparkles size={15} />
            <span>Tailor resume</span>
          </button>

          <button
            className={`nav-item ${activeScreen === "profile" ? "active" : ""}`}
            onClick={() => setActiveScreen("profile")}
          >
            <User size={15} />
            <span>Master profile</span>
          </button>

          <button
            className={`nav-item ${activeScreen === "applications" ? "active" : ""}`}
            onClick={() => setActiveScreen("applications")}
          >
            <Briefcase size={15} />
            <span>Applications</span>
          </button>

          <button
            className={`nav-item ${activeScreen === "templates" ? "active" : ""}`}
            onClick={() => setActiveScreen("templates")}
          >
            <Layers size={15} />
            <span>Templates</span>
          </button>

          <button
            className={`nav-item ${activeScreen === "settings" ? "active" : ""}`}
            onClick={() => setActiveScreen("settings")}
          >
            <Settings size={15} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-badge">
            <span className="avatar-dot" />
            <span>{profile.personal_info.name}</span>
          </div>
          <button
            className="icon-button"
            title="Import profile"
            onClick={() => setIsOnboardingOpen(true)}
          >
            <UploadCloud size={14} />
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="main-viewport">
        {/* ========================================================================= */}
        {/* SCREEN 1: TAILOR RESUME (With Teal-inspired interactive selective tools) */}
        {/* ========================================================================= */}
        {activeScreen === "tailor" && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Top Workspace Header */}
            <header className="top-header">
              <div className="header-title-block">
                <h2>Tailor resume</h2>
                <div className="header-subtitle">
                  {jobTitle} · {company}
                </div>
                {/* Stepper matching screenshot */}
                <div className="stepper-bar">
                  {pipeline.map((stage, idx) => (
                    <React.Fragment key={stage.id}>
                      <span className={`stepper-pill ${stage.status}`}>
                        {stage.label}
                      </span>
                      {idx < pipeline.length - 1 && (
                        <span className="stepper-arrow">&gt;</span>
                      )}
                    </React.Fragment>
                  ))}
                  <button
                    className="btn-neutral"
                    style={{ padding: "2px 8px", fontSize: "0.72rem", marginLeft: "6px" }}
                    onClick={handleRunPipeline}
                    disabled={isProcessing}
                    title="Re-run LangGraph pipeline"
                  >
                    <Play size={10} fill="currentColor" />
                    <span>Run</span>
                  </button>
                </div>
              </div>

              <div>
                <button className="btn-neutral" onClick={handleDownload} id="btn-download-pdf">
                  <Download size={14} />
                  <span>Download PDF</span>
                </button>
              </div>
            </header>

            {/* Two-Pane Workspace */}
            <div className="two-pane-container">
              {/* Left Pane: Analysis & Selective Bullet Builder */}
              <div className="analysis-pane">
                {/* Stats row: Match score & Skill gaps */}
                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-label">Match score</div>
                    <div className="stat-value">{matchScore}%</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Skill gaps</div>
                    <div className="stat-value">{gapSkills.length}</div>
                  </div>
                </div>

                {/* Skills Box with Teal-Style Quick Add */}
                <div className="skills-box">
                  <div className="skills-subgroup">
                    <div className="skills-heading">Matched skills</div>
                    <div className="badge-row">
                      {matchedSkills.map((skill) => (
                        <span key={skill} className="badge-matched">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="skills-subgroup">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div className="skills-heading">Gaps (Click to add if verified)</div>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>+ raises score</span>
                    </div>
                    <div className="badge-row">
                      {gapSkills.length === 0 ? (
                        <span style={{ fontSize: "0.75rem", color: "#22c55e" }}>All target skills matched!</span>
                      ) : (
                        gapSkills.map((skill) => (
                          <button
                            key={skill}
                            className="badge-gap-interactive"
                            onClick={() => handleQuickAddGap(skill)}
                            title={`Click to add ${skill} to your master profile`}
                          >
                            <span>{skill}</span>
                            <Plus size={11} strokeWidth={2.5} />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Teal Pattern: Selective Bullet Points Selector */}
                <div className="selective-bullets-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="skills-heading">Selective achievements ({activeBullets.length} active)</div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Toggle into resume</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {availableBullets.map((bullet) => (
                      <div
                        key={bullet.id}
                        className={`bullet-item-toggle ${bullet.active ? "active" : ""}`}
                        onClick={() => handleToggleBullet(bullet.id)}
                      >
                        <div className={`bullet-checkbox ${bullet.active ? "checked" : ""}`}>
                          {bullet.active ? <Check size={11} strokeWidth={3} /> : null}
                        </div>
                        <div className="bullet-info">
                          <div className="bullet-meta-row">
                            <span className="bullet-provenance-tag">
                              {bullet.source}
                            </span>
                            <div className="badge-row">
                              {bullet.skills.map((s) => (
                                <span
                                  key={s}
                                  className="badge-matched"
                                  style={{ fontSize: "0.65rem", padding: "0px 4px" }}
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                          <p style={{ fontSize: "0.78rem", color: "#d4d4d8", lineHeight: 1.4 }}>
                            {bullet.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Job Description Card */}
                <div className="jd-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="skills-heading">Job description</div>
                    <button
                      className="icon-button"
                      onClick={() => setIsJdExpanded(!isJdExpanded)}
                    >
                      {isJdExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {isJdExpanded ? (
                    <textarea
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                      className="form-input"
                      rows={5}
                      style={{ fontSize: "0.82rem", resize: "vertical" }}
                    />
                  ) : (
                    <div className="jd-text-preview">
                      {jdText}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Pane: Document Preview Container */}
              <div className="preview-pane">
                {rightPaneView === "preview" && (
                  <>
                    <div className="document-frame">
                      {/* Header */}
                      <div className="doc-header-block">
                        <div className="doc-name">{profile.personal_info.name}</div>
                        <div className="doc-contact">
                          {profile.personal_info.email} · {profile.personal_info.phone} · {profile.personal_info.github || "github"}
                        </div>
                      </div>

                      {/* SUMMARY */}
                      <div className="doc-section">
                        <div className="doc-section-title">
                          <span>SUMMARY</span>
                        </div>
                        <div className="doc-bullet-text" style={{ fontSize: "0.78rem" }}>
                          {profile.professional_summary}
                        </div>
                      </div>

                      {/* EXPERIENCE with Dynamic Selective Bullets */}
                      <div className="doc-section">
                        <div className="doc-section-title">
                          <span>EXPERIENCE</span>
                          <span className="doc-trust-badge">
                            <ShieldCheck size={11} style={{ display: "inline", marginRight: "3px" }} />
                            Grounded in profile
                          </span>
                        </div>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>
                            <span>Backend Developer · Acme Corp</span>
                            <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>2022 - Present</span>
                          </div>
                          {activeBullets.map((b, idx) => (
                            <div key={idx} className="doc-bullet-text">
                              • {b}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SKILLS */}
                      <div className="doc-section">
                        <div className="doc-section-title">
                          <span>SKILLS ({profile.skills.length})</span>
                        </div>
                        <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                          {profile.skills.join(" • ")}
                        </div>
                      </div>

                      {/* EDUCATION */}
                      <div className="doc-section">
                        <div className="doc-section-title">
                          <span>EDUCATION</span>
                        </div>
                        <div className="doc-line-placeholder w-90" style={{ marginBottom: "5px" }} />
                        <div className="doc-line-placeholder w-60" />
                      </div>
                    </div>

                    {/* Preview Footer Bar (Matching Screenshot) */}
                    <div className="preview-footer-bar">
                      <span>Version 3 · 1 page · {activeBullets.length} bullets</span>
                      <div className="preview-icon-actions">
                        <button
                          className="icon-button"
                          title="View LaTeX Source"
                          onClick={() => setRightPaneView("latex")}
                        >
                          <Code2 size={15} />
                        </button>
                        <button
                          className="icon-button"
                          title="Version History"
                          onClick={() => setRightPaneView("history")}
                        >
                          <History size={15} />
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {rightPaneView === "latex" && (
                  <div className="document-frame" style={{ maxWidth: "680px", maxHeight: "85vh", overflowY: "auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>output/resume.tex (Compiled by Jinja2)</span>
                      <button className="btn-neutral" onClick={() => setRightPaneView("preview")}>
                        Back to preview
                      </button>
                    </div>
                    <pre style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "#e4e4e7", whiteSpace: "pre-wrap", marginTop: "10px" }}>
                      {latexCode}
                    </pre>
                  </div>
                )}

                {rightPaneView === "history" && (
                  <div className="document-frame" style={{ maxWidth: "580px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Resume version history</span>
                      <button className="btn-neutral" onClick={() => setRightPaneView("preview")}>
                        Back to preview
                      </button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                      <div style={{ padding: "10px", background: "var(--bg-surface)", borderRadius: "6px", display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <strong>Version 3 (Active)</strong>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Target: Acme Corp · {matchScore}% match</div>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "#22c55e" }}>Current</span>
                      </div>
                      <div style={{ padding: "10px", background: "var(--bg-input)", borderRadius: "6px", display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <strong>Version 2</strong>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Target: Stripe · 78% match</div>
                        </div>
                        <button className="icon-button" style={{ fontSize: "0.75rem" }}>Restore</button>
                      </div>
                      <div style={{ padding: "10px", background: "var(--bg-input)", borderRadius: "6px", display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <strong>Version 1</strong>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Target: Linear · 75% match</div>
                        </div>
                        <button className="icon-button" style={{ fontSize: "0.75rem" }}>Restore</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 2: DASHBOARD */}
        {/* ========================================================================= */}
        {activeScreen === "dashboard" && (
          <div className="screen-scroll-container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2>Dashboard</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Overview of your tailored resumes, job applications, and match performance.
                </p>
              </div>
              <button
                className="btn-primary"
                onClick={() => setActiveScreen("tailor")}
              >
                <Plus size={14} />
                <span>Tailor new resume</span>
              </button>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              <div className="stat-box">
                <div className="stat-label">Total applications</div>
                <div className="stat-value">{applications.length}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Tailored resumes generated</div>
                <div className="stat-value">6</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Average role match</div>
                <div className="stat-value">81.5%</div>
              </div>
            </div>

            {/* Recent Resumes Table */}
            <div className="form-card">
              <h3 style={{ fontSize: "0.95rem", fontWeight: 600 }}>Recent tailored resumes</h3>
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Target role</th>
                      <th>Match score</th>
                      <th>Status (Click to cycle)</th>
                      <th>Version</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id}>
                        <td><strong>{app.company}</strong></td>
                        <td>{app.role}</td>
                        <td>
                          <span className="badge-matched">{app.matchScore}%</span>
                        </td>
                        <td>
                          <button
                            className={`stepper-pill ${
                              app.status === "Interview" || app.status === "Offer"
                                ? "completed"
                                : "idle"
                            }`}
                            style={{ cursor: "pointer" }}
                            onClick={() => handleCycleAppStatus(app.id)}
                            title="Click to cycle status: Draft -> Applied -> Interview -> Offer"
                          >
                            {app.status}
                          </button>
                        </td>
                        <td>{app.resumeVersion}</td>
                        <td>{app.date}</td>
                        <td>
                          <button
                            className="btn-neutral"
                            style={{ padding: "3px 8px", fontSize: "0.74rem" }}
                            onClick={() => {
                              setCompany(app.company);
                              setJobTitle(app.role);
                              setActiveScreen("tailor");
                            }}
                          >
                            Open workspace
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 3: MASTER PROFILE */}
        {/* ========================================================================= */}
        {activeScreen === "profile" && (
          <div className="screen-scroll-container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2>Master profile</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  The single source of truth (`master_profile.json`). The agent only reads from this; it never hallucinates.
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className={`btn-neutral ${profileTab === "form" ? "btn-primary" : ""}`}
                  onClick={() => setProfileTab("form")}
                >
                  Structured form
                </button>
                <button
                  className={`btn-neutral ${profileTab === "json" ? "btn-primary" : ""}`}
                  onClick={() => setProfileTab("json")}
                >
                  Raw JSON
                </button>
              </div>
            </div>

            {profileTab === "form" ? (
              <>
                {/* Personal Information */}
                <div className="form-card">
                  <h3 style={{ fontSize: "0.9rem", fontWeight: 600 }}>Personal information</h3>
                  <div className="form-grid">
                    <div className="form-field">
                      <label className="form-label">Full name</label>
                      <input
                        className="form-input"
                        value={profile.personal_info.name}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            personal_info: { ...profile.personal_info, name: e.target.value }
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Email</label>
                      <input
                        className="form-input"
                        value={profile.personal_info.email}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            personal_info: { ...profile.personal_info, email: e.target.value }
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Phone</label>
                      <input
                        className="form-input"
                        value={profile.personal_info.phone}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            personal_info: { ...profile.personal_info, phone: e.target.value }
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Location</label>
                      <input
                        className="form-input"
                        value={profile.personal_info.location}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            personal_info: { ...profile.personal_info, location: e.target.value }
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Verified Skills */}
                <div className="form-card">
                  <h3 style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                    Verified skills ({profile.skills.length})
                  </h3>
                  <div style={{ display: "flex", gap: "8px", maxWidth: "450px" }}>
                    <input
                      className="form-input"
                      style={{ flex: 1 }}
                      placeholder="Add a verified skill (e.g. Kubernetes, AWS)..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                    />
                    <button className="btn-neutral" onClick={handleAddSkill}>
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  </div>
                  <div className="badge-row" style={{ marginTop: "8px" }}>
                    {profile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="badge-matched"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                      >
                        <span>{skill}</span>
                        <Trash2
                          size={11}
                          style={{ cursor: "pointer", opacity: 0.7 }}
                          onClick={() => handleRemoveSkill(skill)}
                        />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div className="form-card">
                  <h3 style={{ fontSize: "0.9rem", fontWeight: 600 }}>Experience history</h3>
                  {profile.experience.map((exp) => (
                    <div
                      key={exp.id}
                      style={{
                        padding: "12px",
                        background: "var(--bg-input)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-subtle)",
                        marginBottom: "10px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <strong>{exp.role} · {exp.company}</strong>
                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{exp.dates}</span>
                      </div>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "8px" }}>
                        {exp.description}
                      </p>
                      <div className="badge-row">
                        {exp.skills.map((s) => (
                          <span key={s} className="badge-matched" style={{ fontSize: "0.7rem", padding: "1px 6px" }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* JSON view mapping to master_profile.json */
              <div className="form-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#22c55e", fontSize: "0.82rem" }}>
                    <FileCheck size={15} />
                    <span>Valid against CandidateProfile Pydantic schema</span>
                  </div>
                </div>
                <textarea
                  className="form-input"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", minHeight: "360px" }}
                  value={JSON.stringify(profile, null, 2)}
                  onChange={(e) => {
                    try {
                      setProfile(JSON.parse(e.target.value));
                    } catch {
                      // ignore parse errors while typing
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 4: APPLICATIONS TRACKER (CRM) */}
        {/* ========================================================================= */}
        {activeScreen === "applications" && (
          <div className="screen-scroll-container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2>Applications tracker</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Every tailored resume is tied to a company and role. Click any status pill to update your job search pipeline.
                </p>
              </div>
              <button
                className="btn-primary"
                onClick={() => {
                  const newApp: ApplicationRecord = {
                    id: `app-${Date.now()}`,
                    company: "New Target Co",
                    role: "Software Engineer",
                    status: "Draft",
                    resumeVersion: `Version ${applications.length + 1}`,
                    matchScore: 80,
                    date: new Date().toISOString().split("T")[0],
                    jobDescription: "Paste new job description here..."
                  };
                  setApplications([newApp, ...applications]);
                }}
              >
                <Plus size={14} />
                <span>Add application</span>
              </button>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Status (Click to change)</th>
                    <th>Resume version</th>
                    <th>Match score</th>
                    <th>Date created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td><strong>{app.company}</strong></td>
                      <td>{app.role}</td>
                      <td>
                        <button
                          className={`stepper-pill ${
                            app.status === "Interview" || app.status === "Offer"
                              ? "completed"
                              : "idle"
                          }`}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleCycleAppStatus(app.id)}
                          title="Click to cycle status: Draft -> Applied -> Interview -> Offer"
                        >
                          {app.status}
                        </button>
                      </td>
                      <td>{app.resumeVersion}</td>
                      <td>
                        <span className="badge-matched">{app.matchScore}%</span>
                      </td>
                      <td>{app.date}</td>
                      <td>
                        <button
                          className="btn-neutral"
                          style={{ padding: "3px 8px", fontSize: "0.75rem" }}
                          onClick={() => {
                            setCompany(app.company);
                            setJobTitle(app.role);
                            setActiveScreen("tailor");
                          }}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 5: TEMPLATES GALLERY */}
        {/* ========================================================================= */}
        {activeScreen === "templates" && (
          <div className="screen-scroll-container">
            <div>
              <h2>Template gallery</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Select Jinja2/LaTeX layouts. All templates adhere strictly to the non-hallucination factuality standard.
              </p>
            </div>

            <div className="templates-grid">
              {TEMPLATES_GALLERY.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className={`template-card ${selectedTemplateId === tmpl.id ? "active" : ""}`}
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{tmpl.category}</span>
                    {selectedTemplateId === tmpl.id && (
                      <span className="badge-matched" style={{ fontSize: "0.7rem", padding: "1px 6px" }}>
                        Selected
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 600 }}>{tmpl.name}</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                      {tmpl.description}
                    </p>
                  </div>
                  <div className="badge-row">
                    {tmpl.tags.map((t) => (
                      <span key={t} className="badge-matched" style={{ fontSize: "0.68rem" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 6: SETTINGS */}
        {/* ========================================================================= */}
        {activeScreen === "settings" && (
          <div className="screen-scroll-container" style={{ maxWidth: "700px" }}>
            <div>
              <h2>Settings</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Manage model endpoints, LangGraph configurations, and factuality parameters.
              </p>
            </div>

            <div className="form-card">
              <h3 style={{ fontSize: "0.9rem", fontWeight: 600 }}>Model tier & endpoint</h3>
              <div className="form-field">
                <label className="form-label">Inference provider</label>
                <select
                  className="form-input"
                  value={modelTier}
                  onChange={(e) => setModelTier(e.target.value)}
                >
                  <option value="gemma-local">Local Gemma-2B (OpenAI compatible proxy)</option>
                  <option value="openai">OpenAI (GPT-4o via API)</option>
                  <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Endpoint base URL</label>
                <input
                  className="form-input"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="form-card">
              <h3 style={{ fontSize: "0.9rem", fontWeight: 600 }}>Trust & factuality guardrails</h3>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: "0.85rem" }}>Strict factuality mode</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Hard-constrains generate_content to reject any bullet point containing unverified employers, dates, or metrics.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={strictFactuality}
                  onChange={(e) => setStrictFactuality(e.target.checked)}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Onboarding / Import Profile Modal */}
      {isOnboardingOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100
          }}
          onClick={() => setIsOnboardingOpen(false)}
        >
          <div
            className="form-card"
            style={{ width: "100%", maxWidth: "480px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Import master profile</h3>
              <button className="icon-button" onClick={() => setIsOnboardingOpen(false)}>✕</button>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Upload an existing resume or LinkedIn archive to populate your structured source of truth.
            </p>
            <div
              style={{
                border: "1px dashed var(--border-medium)",
                borderRadius: "var(--radius-sm)",
                padding: "24px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer"
              }}
            >
              <UploadCloud size={28} color="var(--accent-blue)" />
              <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>Drop resume PDF or JSON here</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Supports PDF, TXT, JSON</div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
              <button className="btn-neutral" onClick={() => setIsOnboardingOpen(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setIsOnboardingOpen(false);
                  setActiveScreen("profile");
                }}
              >
                Load profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
