import React, { useState, useMemo } from "react";
import {
  FileText,
  Briefcase,
  Layers,
  Plus,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Download,
  Check,
  Search,
  MoreHorizontal,
  Play,
  Pencil,
  FileCode,
  Sparkles
} from "lucide-react";
import {
  MITRA_PROFILE,
  INITIAL_RESUMES,
  buildLatexSource,
} from "./mockData";
import type {
  CandidateProfile,
  ResumeRecord,
} from "./mockData";

export const App: React.FC = () => {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<"dashboard" | "editor">("editor");
  const [editorTab, setEditorTab] = useState<"editor" | "matcher" | "latex">("editor");

  // Profile / Resume Document State (Mitra's real data from screenshot)
  const [profile, setProfile] = useState<CandidateProfile>(MITRA_PROFILE);
  const [resumes] = useState<ResumeRecord[]>(INITIAL_RESUMES);
  const [activeResumeId, setActiveResumeId] = useState<string>("res-1");
  const [docTitle, setDocTitle] = useState("AI/ML Engineer — Production RAG");

  // Accordion Expand/Collapse States
  const [expandedSections, setExpandedSections] = useState({
    contact: false,
    title: false,
    summary: false,
    experience: true,
    education: false,
    awards: false,
    skills: false,
  });

  // Target Job Description State (for Job Matcher tab)
  const [jdText, setJdText] = useState(
    "We are looking for an AI/ML Engineer experienced in building RAG knowledge systems, vector embeddings, and backend services with Python and FastAPI. Experience with Docker and Linux is preferred."
  );
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState(100);

  // Toggle Accordion Section
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Toggle Bullet Point Checkbox
  const handleToggleBullet = (bulletId: string) => {
    setProfile((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => ({
        ...exp,
        bullets: exp.bullets.map((b) =>
          b.id === bulletId ? { ...b, checked: !b.checked } : b
        ),
      })),
    }));
  };

  // Toggle Experience Item Checkbox
  const handleToggleExperience = (expId: string) => {
    setProfile((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === expId ? { ...exp, checked: !exp.checked } : exp
      ),
    }));
  };

  // Match Calculation for the target JD
  const targetJobSkills = useMemo(() => {
    return ["Python", "FastAPI", "RAG", "ChromaDB", "Vector Embeddings", "Docker", "Kubernetes", "AWS"];
  }, []);

  const { matchedSkills, gapSkills, matchScore } = useMemo(() => {
    const candidateNorm = new Set(profile.skills.map((s) => s.trim().toLowerCase()));
    const matched = targetJobSkills.filter((s) => candidateNorm.has(s.trim().toLowerCase()));
    const gaps = targetJobSkills.filter((s) => !candidateNorm.has(s.trim().toLowerCase()));
    const score = Math.round((matched.length / Math.max(targetJobSkills.length, 1)) * 100);
    return { matchedSkills: matched, gapSkills: gaps, matchScore: score };
  }, [profile.skills, targetJobSkills]);

  // Quick-Add Gap to Profile
  const handleAddGapSkill = (skill: string) => {
    if (profile.skills.includes(skill)) return;
    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
    }));
  };

  // Run LangGraph Simulation
  const handleRunLangGraph = () => {
    if (isPipelineRunning) return;
    setIsPipelineRunning(true);
    setPipelineProgress(25);

    setTimeout(() => {
      setPipelineProgress(50);
      setTimeout(() => {
        setPipelineProgress(75);
        setTimeout(() => {
          setPipelineProgress(100);
          setIsPipelineRunning(false);
        }, 600);
      }, 600);
    }, 600);
  };

  // Export PDF
  const handleExportPdf = () => {
    window.print();
  };

  const latexCode = useMemo(() => buildLatexSource(profile), [profile]);

  return (
    <div className="teal-shell">
      {/* Left Sidebar */}
      <aside className="teal-sidebar">
        <div className="sidebar-top">
          <div className="brand-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>ResumeAgent</span>
          </div>
        </div>

        <nav className="sidebar-nav-list">
          <button
            className={`sidebar-btn ${currentView === "dashboard" ? "active" : ""}`}
            onClick={() => setCurrentView("dashboard")}
          >
            <FileText size={16} />
            <span>Dashboard</span>
          </button>

          <button
            className={`sidebar-btn ${currentView === "editor" ? "active" : ""}`}
            onClick={() => setCurrentView("editor")}
          >
            <Briefcase size={16} />
            <span>Resume Builder</span>
          </button>

          <button
            className="sidebar-btn"
            onClick={() => {
              setCurrentView("editor");
              setEditorTab("matcher");
            }}
          >
            <Sparkles size={16} />
            <span>Job Matcher</span>
          </button>

          <button
            className="sidebar-btn"
            onClick={() => {
              setCurrentView("editor");
              setEditorTab("latex");
            }}
          >
            <FileCode size={16} />
            <span>LaTeX Source</span>
          </button>

          <button
            className="sidebar-btn"
            onClick={() => {
              setCurrentView("editor");
              toggleSection("skills");
            }}
          >
            <Layers size={16} />
            <span>Master Profile</span>
          </button>
        </nav>

        <div className="sidebar-bottom-links">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#0d9488", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700" }}>
              MK
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-main)" }}>Mitra Kulal</span>
              <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>Candidate</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="teal-main">
        {/* ========================================================================= */}
        {/* VIEW 1: DASHBOARD (Matching Teal Image 1) */}
        {/* ========================================================================= */}
        {currentView === "dashboard" && (
          <div className="dashboard-page">
            <div className="page-title-row">
              <h1 className="page-title">Resume Builder</h1>
            </div>

            {/* Top 3 Action Cards (Only features we provide) */}
            <div className="actions-grid">
              <div
                className="action-card"
                onClick={() => {
                  setCurrentView("editor");
                  setDocTitle("New Untitled Resume");
                }}
              >
                <div className="action-icon-circle" style={{ backgroundColor: "#f0fdf4", color: "#16a34a" }}>
                  <Plus size={22} strokeWidth={2.5} />
                </div>
                <span className="action-title">New Resume</span>
              </div>

              <div
                className="action-card"
                onClick={() => {
                  setCurrentView("editor");
                  setEditorTab("matcher");
                }}
              >
                <div className="action-icon-circle" style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}>
                  <Briefcase size={20} />
                </div>
                <span className="action-title">Start from job description</span>
              </div>

              <div
                className="action-card"
                onClick={() => {
                  setCurrentView("editor");
                  setEditorTab("latex");
                }}
              >
                <div className="action-icon-circle" style={{ backgroundColor: "#fdf2f8", color: "#db2777" }}>
                  <FileCode size={20} />
                </div>
                <span className="action-title">Start from LaTeX template</span>
              </div>
            </div>

            {/* Recent Resumes Section */}
            <div className="recent-section">
              <div className="recent-header-row">
                <span className="recent-title">Recent Resumes</span>
                <div className="search-bar-wrap">
                  <div className="search-input-box">
                    <Search size={14} />
                    <input placeholder="Search Resumes" />
                  </div>
                </div>
              </div>

              <div className="resumes-grid">
                {resumes.map((res) => (
                  <div
                    key={res.id}
                    className={`resume-card ${activeResumeId === res.id ? "active" : ""}`}
                    onClick={() => {
                      setActiveResumeId(res.id);
                      setDocTitle(res.title);
                      setJdText(res.jdText);
                      setCurrentView("editor");
                    }}
                  >
                    <div className="resume-card-top">
                      <span className="resume-card-title">{res.title}</span>
                      <MoreHorizontal size={15} color="#94a3b8" />
                    </div>

                    <div className="resume-card-meta">
                      <div className="match-badge-chip">
                        <span>🎯 Match: {res.matchScore}%</span>
                      </div>
                      <span>Edited: {res.lastEdited}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: RESUME BUILDER & WORKSPACE (Matching Teal Image 2) */}
        {/* ========================================================================= */}
        {currentView === "editor" && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Top Bar with Back Arrow, Document Title, and Export PDF */}
            <header className="editor-top-nav">
              <div className="nav-left-group">
                <button
                  className="btn-icon-back"
                  onClick={() => setCurrentView("dashboard")}
                  title="Back to Resumes"
                >
                  <ArrowLeft size={16} />
                </button>
                <input
                  className="doc-editable-title"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                />
              </div>

              <div className="nav-right-group">
                <button className="btn-export-pdf" onClick={handleExportPdf}>
                  <Download size={14} />
                  <span>Export PDF</span>
                </button>
              </div>
            </header>

            {/* Sub-tabs bar: Content Editor | Job Matcher | LaTeX Source */}
            <div className="sub-tabs-bar">
              <button
                className={`sub-tab-btn ${editorTab === "editor" ? "active" : ""}`}
                onClick={() => setEditorTab("editor")}
              >
                <FileText size={14} />
                <span>Content Editor</span>
              </button>

              <button
                className={`sub-tab-btn ${editorTab === "matcher" ? "active" : ""}`}
                onClick={() => setEditorTab("matcher")}
              >
                <Sparkles size={14} />
                <span>Job Matcher</span>
                <span className="tab-badge green">{matchScore}%</span>
              </button>

              <button
                className={`sub-tab-btn ${editorTab === "latex" ? "active" : ""}`}
                onClick={() => setEditorTab("latex")}
              >
                <FileCode size={14} />
                <span>LaTeX Source</span>
              </button>
            </div>

            {/* Split Workspace */}
            <div className="workspace-two-pane">
              {/* Left Pane (Accordions & Checkboxes) */}
              <div className="accordion-column">
                {editorTab === "editor" && (
                  <>
                    {/* Contact Information Accordion */}
                    <div className="accordion-section">
                      <div className="accordion-header" onClick={() => toggleSection("contact")}>
                        <div className="accordion-title-wrap">
                          {expandedSections.contact ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <span>Contact Information</span>
                        </div>
                        <div className="accordion-actions">
                          <Pencil size={13} />
                        </div>
                      </div>

                      {expandedSections.contact && (
                        <div className="accordion-content">
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                            <div>
                              <label style={{ fontSize: "11px", color: "var(--text-dim)" }}>Name</label>
                              <input
                                style={{ width: "100%", padding: "5px 8px", border: "1px solid var(--border-subtle)", borderRadius: "4px", fontSize: "12px" }}
                                value={profile.personal_info.name}
                                onChange={(e) => setProfile({ ...profile, personal_info: { ...profile.personal_info, name: e.target.value } })}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: "11px", color: "var(--text-dim)" }}>Location</label>
                              <input
                                style={{ width: "100%", padding: "5px 8px", border: "1px solid var(--border-subtle)", borderRadius: "4px", fontSize: "12px" }}
                                value={profile.personal_info.location}
                                onChange={(e) => setProfile({ ...profile, personal_info: { ...profile.personal_info, location: e.target.value } })}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Target Title Accordion */}
                    <div className="accordion-section">
                      <div className="accordion-header" onClick={() => toggleSection("title")}>
                        <div className="accordion-title-wrap">
                          {expandedSections.title ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <span>Target Title</span>
                        </div>
                        <div className="accordion-actions">
                          <Plus size={14} />
                        </div>
                      </div>

                      {expandedSections.title && (
                        <div className="accordion-content">
                          <input
                            style={{ width: "100%", padding: "6px 8px", border: "1px solid var(--border-subtle)", borderRadius: "4px", fontSize: "12.5px" }}
                            value={profile.personal_info.targetTitle || ""}
                            onChange={(e) => setProfile({ ...profile, personal_info: { ...profile.personal_info, targetTitle: e.target.value } })}
                          />
                        </div>
                      )}
                    </div>

                    {/* Professional Summary Accordion */}
                    <div className="accordion-section">
                      <div className="accordion-header" onClick={() => toggleSection("summary")}>
                        <div className="accordion-title-wrap">
                          {expandedSections.summary ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <span>Professional Summary</span>
                        </div>
                        <div className="accordion-actions">
                          <Plus size={14} />
                        </div>
                      </div>

                      {expandedSections.summary && (
                        <div className="accordion-content">
                          <textarea
                            style={{ width: "100%", padding: "8px", border: "1px solid var(--border-subtle)", borderRadius: "4px", fontSize: "12px", minHeight: "80px", lineHeight: "1.45" }}
                            value={profile.professional_summary}
                            onChange={(e) => setProfile({ ...profile, professional_summary: e.target.value })}
                          />
                        </div>
                      )}
                    </div>

                    {/* Work Experience Accordion (EXPANDED by default, matching Image 2) */}
                    <div className="accordion-section">
                      <div className="accordion-header" onClick={() => toggleSection("experience")}>
                        <div className="accordion-title-wrap teal">
                          {expandedSections.experience ? <ChevronDown size={16} color="#0d9488" /> : <ChevronRight size={16} />}
                          <span>Work Experience</span>
                        </div>
                        <div className="accordion-actions">
                          <Plus size={14} />
                          <MoreHorizontal size={14} />
                        </div>
                      </div>

                      {expandedSections.experience && (
                        <div className="accordion-content">
                          {profile.experience.map((exp) => (
                            <div key={exp.id} className="experience-block">
                              {/* Company Checkbox */}
                              <div
                                className="company-checkbox-row"
                                onClick={() => handleToggleExperience(exp.id)}
                              >
                                <div className={`teal-checkbox ${exp.checked ? "checked" : ""}`}>
                                  {exp.checked && <Check size={11} strokeWidth={3} />}
                                </div>
                                <span>{exp.company}</span>
                              </div>

                              {/* Role Checkbox */}
                              <div className="role-checkbox-row">
                                <div className={`teal-checkbox ${exp.checked ? "checked" : ""}`}>
                                  {exp.checked && <Check size={11} strokeWidth={3} />}
                                </div>
                                <span>{exp.role}</span>
                              </div>

                              {/* Dates Checkbox */}
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-muted)", marginLeft: "4px" }}>
                                <div className={`teal-checkbox ${exp.checked ? "checked" : ""}`}>
                                  {exp.checked && <Check size={11} strokeWidth={3} />}
                                </div>
                                <span>{exp.dates}</span>
                              </div>

                              {/* Bullets with Checkboxes matching Image 2! */}
                              <div className="bullets-list">
                                {exp.bullets.map((b) => (
                                  <div
                                    key={b.id}
                                    className="bullet-check-row"
                                    onClick={() => handleToggleBullet(b.id)}
                                  >
                                    <div className={`teal-checkbox ${b.checked ? "checked" : ""}`}>
                                      {b.checked && <Check size={11} strokeWidth={3} />}
                                    </div>
                                    <span className="bullet-text-label">
                                      {b.prefix && <strong>{b.prefix} </strong>}
                                      {b.text}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              <button
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  padding: "5px 10px",
                                  border: "1px dashed var(--border-medium)",
                                  background: "transparent",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  color: "var(--teal-primary)",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  width: "fit-content",
                                  marginTop: "6px"
                                }}
                              >
                                <Plus size={13} />
                                <span>Add Bullet</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Education Accordion */}
                    <div className="accordion-section">
                      <div className="accordion-header" onClick={() => toggleSection("education")}>
                        <div className="accordion-title-wrap">
                          {expandedSections.education ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <span>Education</span>
                        </div>
                        <div className="accordion-actions">
                          <Plus size={14} />
                        </div>
                      </div>

                      {expandedSections.education && (
                        <div className="accordion-content">
                          {profile.education.map((edu) => (
                            <div key={edu.id} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <strong>{edu.school}</strong>
                              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{edu.degree} · {edu.year}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Skills Accordion */}
                    <div className="accordion-section">
                      <div className="accordion-header" onClick={() => toggleSection("skills")}>
                        <div className="accordion-title-wrap">
                          {expandedSections.skills ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <span>Skills ({profile.skills.length})</span>
                        </div>
                        <div className="accordion-actions">
                          <Plus size={14} />
                        </div>
                      </div>

                      {expandedSections.skills && (
                        <div className="accordion-content">
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                            {profile.skills.map((s) => (
                              <span
                                key={s}
                                style={{
                                  background: "#f1f5f9",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  fontSize: "11.5px",
                                  color: "#334155"
                                }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Job Matcher Tab */}
                {editorTab === "matcher" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: "6px", padding: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: "18px", fontWeight: "700", color: "#0f766e" }}>{matchScore}% Match Score</div>
                          <div style={{ fontSize: "12px", color: "#115e59" }}>Calculated against target requirements</div>
                        </div>
                        <button
                          style={{
                            background: "#0d9488",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px"
                          }}
                          onClick={handleRunLangGraph}
                          disabled={isPipelineRunning}
                        >
                          <Play size={12} fill="currentColor" />
                          <span>{isPipelineRunning ? "Running..." : "Run LangGraph"}</span>
                        </button>
                      </div>

                      {isPipelineRunning && (
                        <div style={{ width: "100%", height: "4px", background: "#ccfbf1", borderRadius: "2px", marginTop: "10px", overflow: "hidden" }}>
                          <div style={{ width: `${pipelineProgress}%`, height: "100%", background: "#0d9488", transition: "width 0.4s ease" }} />
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-main)", display: "block", marginBottom: "4px" }}>
                        Target Job Description
                      </label>
                      <textarea
                        style={{ width: "100%", padding: "8px", border: "1px solid var(--border-subtle)", borderRadius: "4px", fontSize: "12px", minHeight: "100px", lineHeight: "1.4" }}
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                      />
                    </div>

                    <div>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-main)", display: "block", marginBottom: "6px" }}>
                        Matched Skills ({matchedSkills.length})
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                        {matchedSkills.map((s) => (
                          <span key={s} style={{ background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600" }}>
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-main)", display: "block", marginBottom: "6px" }}>
                        Missing Keywords / Gaps (Click to add)
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                        {gapSkills.map((s) => (
                          <button
                            key={s}
                            style={{
                              background: "#fef3c7",
                              border: "1px solid #fde68a",
                              color: "#b45309",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                            onClick={() => handleAddGapSkill(s)}
                          >
                            + {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* LaTeX Source Code Tab */}
                {editorTab === "latex" && (
                  <div>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-main)", display: "block", marginBottom: "6px" }}>
                      output/resume.tex
                    </span>
                    <pre style={{ background: "#0f172a", color: "#f8fafc", padding: "12px", borderRadius: "6px", fontSize: "11.5px", fontFamily: "var(--font-mono)", whiteSpace: "pre-wrap", overflowX: "auto" }}>
                      {latexCode}
                    </pre>
                  </div>
                )}
              </div>

              {/* Right Pane (Live Rendered Resume Sheet matching Image 2) */}
              <div className="preview-column">
                <div className="sheet-paper">
                  {/* Name & Contact */}
                  <div className="sheet-name">{profile.personal_info.name}</div>
                  <div className="sheet-contact">
                    {profile.personal_info.location} • {profile.personal_info.phone} • {profile.personal_info.email}
                  </div>

                  {/* AI Target Title */}
                  <div className="sheet-target-title">
                    {profile.personal_info.targetTitle || "AI"}
                  </div>

                  {/* Professional Summary */}
                  <div className="sheet-summary">
                    {profile.professional_summary}
                  </div>

                  {/* WORK EXPERIENCE */}
                  <div className="sheet-section-title">WORK EXPERIENCE</div>
                  {profile.experience
                    .filter((exp) => exp.checked)
                    .map((exp) => (
                      <div key={exp.id} style={{ marginBottom: "10px" }}>
                        <div className="sheet-exp-header">
                          <span>{exp.company}</span>
                          <span style={{ fontWeight: "400", color: "#64748b" }}>{exp.dates}</span>
                        </div>
                        <div className="sheet-exp-role">{exp.role}</div>

                        {exp.bullets
                          .filter((b) => b.checked)
                          .map((b) => (
                            <div key={b.id} className="sheet-bullet-item">
                              {b.prefix && <strong>{b.prefix} </strong>}
                              {b.text}
                            </div>
                          ))}
                      </div>
                    ))}

                  {/* EDUCATION */}
                  <div className="sheet-section-title">EDUCATION</div>
                  {profile.education
                    .filter((edu) => edu.checked)
                    .map((edu) => (
                      <div key={edu.id} style={{ marginBottom: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", fontWeight: "700" }}>
                          <span>{edu.degree}</span>
                        </div>
                        <div style={{ fontSize: "10px", color: "#475569" }}>
                          {edu.school} • {edu.gpa} • {edu.location} • {edu.year}
                        </div>
                      </div>
                    ))}

                  {/* AWARDS & SCHOLARSHIPS */}
                  <div className="sheet-section-title">AWARDS & SCHOLARSHIPS</div>
                  {profile.awards
                    .filter((aw) => aw.checked)
                    .map((aw) => (
                      <div key={aw.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5px", marginBottom: "3px" }}>
                        <span>
                          <strong>{aw.title}</strong>, {aw.organization}
                        </span>
                        <span style={{ color: "#64748b" }}>{aw.year}</span>
                      </div>
                    ))}

                  {/* TECHNICAL SKILLS */}
                  <div className="sheet-section-title">TECHNICAL SKILLS</div>
                  <div style={{ fontSize: "9.5px", color: "#334155", lineHeight: "1.4" }}>
                    {profile.skills.join(" • ")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
