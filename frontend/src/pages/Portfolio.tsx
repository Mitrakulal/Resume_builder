import { useState } from "react";
import { Button, Card, Chip, PageHeader } from "../components/ui.tsx";
import { useApp } from "../store/AppContext.tsx";
import type {
  CandidateProfile,
  ExperienceItem,
  ProjectItem,
  EducationItem,
} from "../lib/types.ts";
import { Plus, Trash2, Edit3, Check, X, Download, Upload, Save } from "lucide-react";

/* --------------------------- Local helpers --------------------------- */

const inputCls =
  "w-full rounded-2xl border border-ink/15 bg-cream/50 px-4 py-2.5 text-[15px] outline-none transition-colors focus:border-accent";

function TextField({
  id,
  label,
  value,
  onChange,
  textarea = false,
  placeholder,
  rows = 3,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-inksoft">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`${inputCls} leading-relaxed`}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputCls}
        />
      )}
    </div>
  );
}

/* ------------------------------- Page -------------------------------- */

export default function Portfolio() {
  const {
    profile,
    updateProfile,
    saveProfileToBackend,
    isLoadingProfile,
    profileError,
    reloadProfile,
  } = useApp();

  // Experience editing state
  const [editingExpIdx, setEditingExpIdx] = useState<number | null>(null);
  const [expDraft, setExpDraft] = useState<ExperienceItem | null>(null);
  const [isAddingExp, setIsAddingExp] = useState(false);

  // Project editing state
  const [editingProjIdx, setEditingProjIdx] = useState<number | null>(null);
  const [projDraft, setProjDraft] = useState<ProjectItem | null>(null);
  const [isAddingProj, setIsAddingProj] = useState(false);

  // Education editing state
  const [editingEduIdx, setEditingEduIdx] = useState<number | null>(null);
  const [eduDraft, setEduDraft] = useState<EducationItem | null>(null);
  const [isAddingEdu, setIsAddingEdu] = useState(false);

  // Quick inputs
  const [newSkill, setNewSkill] = useState("");
  const [newCert, setNewCert] = useState("");
  const [newLink, setNewLink] = useState("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  if (isLoadingProfile) {
    return (
      <div className="flex h-64 items-center justify-center text-inksoft">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span>Loading master profile from backend...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Card className="p-8 text-center">
          <h1 className="font-display text-2xl font-semibold">Could not load your profile</h1>
          <p className="mx-auto mt-3 max-w-lg text-inksoft">
            {profileError ?? "The backend did not return master_profile.json."}
          </p>
          <Button className="mt-6" onClick={() => void reloadProfile()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const patch = (p: Partial<CandidateProfile>) => updateProfile(p);

  const handleSaveToBackend = async () => {
    setSaveStatus("Saving...");
    try {
      await saveProfileToBackend();
      setSaveStatus("Saved to backend!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus(error instanceof Error ? `Failed: ${error.message}` : "Failed to save");
      setTimeout(() => setSaveStatus(null), 6000);
    }
  };

  const handleUploadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.personal_info) {
          updateProfile(json);
          alert("Profile loaded successfully from JSON! Click 'Save to Backend' to sync.");
        } else {
          alert("Invalid profile JSON: missing personal_info");
        }
      } catch {
        alert("Invalid JSON file format");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "master_profile.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  /* ------------------------------ Contact ----------------------------- */

  const setContact = (k: keyof CandidateProfile["personal_info"], v: string | string[]) =>
    patch({ personal_info: { ...profile.personal_info, [k]: v } });

  const addLink = () => {
    const trimmed = newLink.trim();
    if (!trimmed || profile.personal_info.links?.includes(trimmed)) return;
    setContact("links", [...(profile.personal_info.links || []), trimmed]);
    setNewLink("");
  };

  const removeLink = (l: string) => {
    setContact("links", (profile.personal_info.links || []).filter((x) => x !== l));
  };

  /* ---------------------------- Experience ---------------------------- */

  const startExpEdit = (index: number, item: ExperienceItem) => {
    setEditingExpIdx(index);
    setExpDraft({
      ...item,
      role: item.role || item.title || "",
      company: item.company || item.organization || "",
      date: item.date || item.dates || (item.startDate ? `${item.startDate} - ${item.endDate || "Present"}` : ""),
      location: item.location || "",
      description: item.description || "",
      skills: [...(item.skills || item.skillsUsed || [])],
    });
  };

  const saveExpEdit = () => {
    if (editingExpIdx === null || !expDraft) return;
    const updated = [...profile.experience];
    updated[editingExpIdx] = expDraft;
    patch({ experience: updated });
    setEditingExpIdx(null);
    setExpDraft(null);
  };

  const deleteExp = (index: number) => {
    patch({ experience: profile.experience.filter((_, i) => i !== index) });
  };

  const addNewExp = () => {
    const newEntry: ExperienceItem = {
      role: "New Role",
      company: "Company Name",
      date: "2026 - Present",
      location: "City, Country",
      description: "Describe key responsibilities, architectures, and metrics...",
      skills: [],
    };
    patch({ experience: [newEntry, ...profile.experience] });
    startExpEdit(0, newEntry);
    setIsAddingExp(false);
  };

  /* ----------------------------- Projects ----------------------------- */

  const projectsList = profile.projects || [];

  const startProjEdit = (index: number, item: ProjectItem) => {
    setEditingProjIdx(index);
    setProjDraft({
      ...item,
      name: item.name || "",
      technologies: item.technologies || (item.skillsUsed ? item.skillsUsed.join(", ") : ""),
      date: item.date || "",
      description: item.description || "",
      skills: [...(item.skills || item.skillsUsed || [])],
    });
  };

  const saveProjEdit = () => {
    if (editingProjIdx === null || !projDraft) return;
    const updated = [...projectsList];
    updated[editingProjIdx] = projDraft;
    patch({ projects: updated });
    setEditingProjIdx(null);
    setProjDraft(null);
  };

  const deleteProj = (index: number) => {
    patch({ projects: projectsList.filter((_, i) => i !== index) });
  };

  const addNewProj = () => {
    const newEntry: ProjectItem = {
      name: "New Project",
      technologies: "Tech Stack (e.g. Python, React, Docker)",
      date: "2026",
      description: "Describe project architecture, features, and technical impact...",
      skills: [],
    };
    patch({ projects: [newEntry, ...projectsList] });
    startProjEdit(0, newEntry);
    setIsAddingProj(false);
  };

  /* ---------------------------- Education ----------------------------- */

  const startEduEdit = (index: number, item: EducationItem) => {
    setEditingEduIdx(index);
    setEduDraft({
      ...item,
      institution: item.institution || item.school || "",
      degree: item.degree || "",
      location: item.location || "",
      date: item.date || item.year || (item.startDate ? `${item.startDate} - ${item.endDate}` : ""),
      details: item.details || "",
    });
  };

  const saveEduEdit = () => {
    if (editingEduIdx === null || !eduDraft) return;
    const updated = [...profile.education];
    updated[editingEduIdx] = eduDraft;
    patch({ education: updated });
    setEditingEduIdx(null);
    setEduDraft(null);
  };

  const deleteEdu = (index: number) => {
    patch({ education: profile.education.filter((_, i) => i !== index) });
  };

  const addNewEdu = () => {
    const newEntry: EducationItem = {
      institution: "University / Institution",
      degree: "Degree / Specialization",
      location: "City, Country",
      date: "Expected 2028",
      details: "",
    };
    patch({ education: [...profile.education, newEntry] });
    startEduEdit(profile.education.length, newEntry);
    setIsAddingEdu(false);
  };

  /* ------------------------------- Skills ------------------------------ */

  const addSkill = () => {
    const s = newSkill.trim();
    if (!s || profile.skills.includes(s)) return;
    patch({ skills: [...profile.skills, s] });
    setNewSkill("");
  };

  const removeSkill = (s: string) => {
    patch({ skills: profile.skills.filter((x) => x !== s) });
  };

  /* --------------------------- Certifications -------------------------- */

  const certsList = profile.certifications || [];

  const addCert = () => {
    const c = newCert.trim();
    if (!c || certsList.includes(c)) return;
    patch({ certifications: [...certsList, c] });
    setNewCert("");
  };

  const removeCert = (c: string) => {
    patch({ certifications: certsList.filter((x) => x !== c) });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Candidate Portfolio"
        sub="Your single source of truth. The tailoring pipeline reads strictly from this data to build customized resumes."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {saveStatus && (
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                  saveStatus.includes("Failed") || saveStatus.includes("Error")
                    ? "text-red-700 bg-red-50 border-red-200"
                    : saveStatus === "Saving..."
                    ? "text-accent bg-accent/10 border-accent/20 animate-pulse"
                    : "text-emerald-700 bg-emerald-50 border-emerald-200"
                }`}
              >
                {saveStatus}
              </span>
            )}
            <Button onClick={handleSaveToBackend}>
              <Save className="mr-1.5 h-4 w-4" /> Save to Backend
            </Button>
            <Button variant="outline" onClick={handleDownloadJson} title="Export JSON backup">
              <Download className="mr-1.5 h-4 w-4" /> Export
            </Button>
            <label className="cursor-pointer">
              <Button variant="outline" type="button" onClick={() => document.getElementById("json-upload")?.click()}>
                <Upload className="mr-1.5 h-4 w-4" /> Import JSON
              </Button>
              <input id="json-upload" type="file" accept=".json" className="hidden" onChange={handleUploadJson} />
            </label>
          </div>
        }
      />

      {/* Professional Summary */}
      <Card className="mb-8 p-6 sm:p-8">
        <h2 className="font-display mb-2 text-xl font-semibold">Professional Summary</h2>
        <p className="mb-4 text-xs text-inksoft">
          Master summary paragraph. The LLM uses this to understand your core positioning and tailor role-specific summaries.
        </p>
        <TextField
          id="profile-summary"
          label="Summary statement"
          textarea
          rows={4}
          value={profile.professional_summary || ""}
          onChange={(v) => patch({ professional_summary: v })}
          placeholder="AI/ML engineer specializing in..."
        />
      </Card>

      {/* Contact Info */}
      <Card className="mb-8 p-6 sm:p-8">
        <h2 className="font-display mb-4 text-xl font-semibold">Personal & Contact Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="contact-name"
            label="Full Name"
            value={profile.personal_info.name}
            onChange={(v) => setContact("name", v)}
          />
          <TextField
            id="contact-email"
            label="Email"
            value={profile.personal_info.email}
            onChange={(v) => setContact("email", v)}
          />
          <TextField
            id="contact-phone"
            label="Phone"
            value={profile.personal_info.phone || ""}
            onChange={(v) => setContact("phone", v)}
          />
          <TextField
            id="contact-location"
            label="Location"
            value={profile.personal_info.location || ""}
            onChange={(v) => setContact("location", v)}
          />
        </div>

        <div className="mt-5 border-t border-ink/8 pt-4">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-inksoft">
            Links & Online Profiles
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {(profile.personal_info.links || []).map((link) => (
              <Chip key={link}>
                <span className="font-mono text-xs">{link}</span>
                <button
                  type="button"
                  onClick={() => removeLink(link)}
                  className="ml-1.5 cursor-pointer text-inksoft hover:text-red-600"
                  title="Remove link"
                >
                  <X className="h-3 w-3" />
                </button>
              </Chip>
            ))}
          </div>
          <div className="flex max-w-md gap-2">
            <input
              type="text"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addLink();
              }}
              placeholder="e.g. github.com/username or linkedin.com/in/..."
              className={inputCls}
            />
            <Button size="sm" variant="outline" onClick={addLink}>
              Add
            </Button>
          </div>
        </div>
      </Card>

      {/* Work Experience */}
      <section aria-label="Experience" className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Work Experience</h2>
            <p className="text-xs text-inksoft">
              Real employment, contract, and internships. The agent selects and extracts bullet points from these.
            </p>
          </div>
          <Button size="sm" onClick={addNewExp}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Experience
          </Button>
        </div>

        <div className="space-y-4">
          {profile.experience.map((item, idx) => {
            const role = item.role || item.title || "Untitled Role";
            const company = item.company || item.organization || "Company";
            const date = item.date || item.dates || (item.startDate ? `${item.startDate} - ${item.endDate || "Present"}` : "");
            const skillsList = item.skills || item.skillsUsed || [];

            if (editingExpIdx === idx && expDraft) {
              return (
                <Card key={idx} className="border-accent/40 bg-white p-6 shadow-md">
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextField
                        id={`exp-role-${idx}`}
                        label="Role / Title"
                        value={expDraft.role || ""}
                        onChange={(v) => setExpDraft({ ...expDraft, role: v })}
                      />
                      <TextField
                        id={`exp-company-${idx}`}
                        label="Company / Studio"
                        value={expDraft.company || ""}
                        onChange={(v) => setExpDraft({ ...expDraft, company: v })}
                      />
                      <TextField
                        id={`exp-date-${idx}`}
                        label="Dates / Year"
                        value={expDraft.date || ""}
                        onChange={(v) => setExpDraft({ ...expDraft, date: v })}
                      />
                      <TextField
                        id={`exp-location-${idx}`}
                        label="Location (optional)"
                        value={expDraft.location || ""}
                        onChange={(v) => setExpDraft({ ...expDraft, location: v })}
                      />
                    </div>
                    <TextField
                      id={`exp-desc-${idx}`}
                      label="Raw Description & Achievements"
                      textarea
                      rows={4}
                      value={expDraft.description || ""}
                      onChange={(v) => setExpDraft({ ...expDraft, description: v })}
                      placeholder="Detailed responsibilities, metrics, and accomplishments..."
                    />
                    <TextField
                      id={`exp-skills-${idx}`}
                      label="Skills Used (comma-separated)"
                      value={(expDraft.skills || []).join(", ")}
                      onChange={(v) =>
                        setExpDraft({
                          ...expDraft,
                          skills: v
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                    <div className="flex justify-end gap-2 pt-2 border-t border-ink/8">
                      <Button variant="ghost" size="sm" onClick={() => setEditingExpIdx(null)}>
                        <X className="mr-1 h-3.5 w-3.5" /> Cancel
                      </Button>
                      <Button size="sm" onClick={saveExpEdit}>
                        <Check className="mr-1 h-3.5 w-3.5" /> Save Experience
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            }

            return (
              <Card key={idx} className="p-6 transition-all hover:border-ink/20">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-[260px]">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-lg font-semibold text-ink">{role}</h3>
                      <span className="text-sm font-medium text-accent">@ {company}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-inksoft">
                      {date} {item.location ? `· ${item.location}` : ""}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-ink/85">{item.description}</p>
                    {skillsList.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {skillsList.map((s) => (
                          <span
                            key={s}
                            className="rounded-md bg-cream px-2 py-0.5 text-[11px] font-medium text-inksoft border border-ink/10"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="sm" onClick={() => startExpEdit(idx, item)} title="Edit">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteExp(idx)}
                      className="text-inksoft hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Projects */}
      <section aria-label="Projects" className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Projects</h2>
            <p className="text-xs text-inksoft">
              Personal, open-source, and research projects. The agent synthesizes project bullets for tailored resumes.
            </p>
          </div>
          <Button size="sm" onClick={addNewProj}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Project
          </Button>
        </div>

        <div className="space-y-4">
          {projectsList.map((item, idx) => {
            const tech = item.technologies || (item.skills ? item.skills.join(", ") : "");

            if (editingProjIdx === idx && projDraft) {
              return (
                <Card key={idx} className="border-accent/40 bg-white p-6 shadow-md">
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextField
                        id={`proj-name-${idx}`}
                        label="Project Name"
                        value={projDraft.name}
                        onChange={(v) => setProjDraft({ ...projDraft, name: v })}
                      />
                      <TextField
                        id={`proj-date-${idx}`}
                        label="Date / Year"
                        value={projDraft.date || ""}
                        onChange={(v) => setProjDraft({ ...projDraft, date: v })}
                      />
                    </div>
                    <TextField
                      id={`proj-tech-${idx}`}
                      label="Technologies (e.g. LangGraph, Python, Docker)"
                      value={projDraft.technologies || ""}
                      onChange={(v) => setProjDraft({ ...projDraft, technologies: v })}
                    />
                    <TextField
                      id={`proj-desc-${idx}`}
                      label="Description & Architecture Details"
                      textarea
                      rows={4}
                      value={projDraft.description || ""}
                      onChange={(v) => setProjDraft({ ...projDraft, description: v })}
                    />
                    <div className="flex justify-end gap-2 pt-2 border-t border-ink/8">
                      <Button variant="ghost" size="sm" onClick={() => setEditingProjIdx(null)}>
                        <X className="mr-1 h-3.5 w-3.5" /> Cancel
                      </Button>
                      <Button size="sm" onClick={saveProjEdit}>
                        <Check className="mr-1 h-3.5 w-3.5" /> Save Project
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            }

            return (
              <Card key={idx} className="p-6 transition-all hover:border-ink/20">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-[260px]">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-lg font-semibold text-ink">{item.name}</h3>
                      {item.date && <span className="text-xs text-inksoft">({item.date})</span>}
                    </div>
                    {tech && (
                      <p className="mt-1 font-mono text-xs text-accentdeep font-medium">
                        {tech}
                      </p>
                    )}
                    <p className="mt-2 text-sm leading-relaxed text-ink/85">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="sm" onClick={() => startProjEdit(idx, item)} title="Edit">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProj(idx)}
                      className="text-inksoft hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Skills */}
      <Card className="mb-8 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-xl font-semibold">Skills Inventory</h2>
          <span className="text-xs text-inksoft font-medium">
            {profile.skills.length} skills listed
          </span>
        </div>
        <p className="mb-4 text-xs text-inksoft">
          All technical, domain, and tool proficiencies. The agent matches these against incoming JDs.
        </p>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((s) => (
            <Chip key={s}>
              {s}
              <button
                type="button"
                aria-label={`Remove skill ${s}`}
                onClick={() => removeSkill(s)}
                className="ml-1 cursor-pointer rounded-full px-1 leading-none text-inksoft hover:text-red-700"
              >
                ×
              </button>
            </Chip>
          ))}
        </div>
        <div className="mt-4 flex gap-2 max-w-sm">
          <input
            id="new-skill"
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addSkill();
            }}
            placeholder="Add a new skill…"
            aria-label="New skill"
            className={inputCls}
          />
          <Button size="sm" onClick={addSkill}>
            Add
          </Button>
        </div>
      </Card>

      {/* Education */}
      <Card className="mb-8 p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Education</h2>
            <p className="text-xs text-inksoft">Degrees, institutions, and academic milestones.</p>
          </div>
          <Button size="sm" variant="outline" onClick={addNewEdu}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Education
          </Button>
        </div>

        <div className="space-y-4">
          {profile.education.map((e, idx) => {
            const inst = e.institution || e.school || "Institution";
            const date = e.date || e.year || (e.startDate ? `${e.startDate} - ${e.endDate}` : "");

            if (editingEduIdx === idx && eduDraft) {
              return (
                <div key={idx} className="rounded-xl border border-accent/40 bg-white p-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                      id={`edu-inst-${idx}`}
                      label="Institution / University"
                      value={eduDraft.institution}
                      onChange={(v) => setEduDraft({ ...eduDraft, institution: v })}
                    />
                    <TextField
                      id={`edu-degree-${idx}`}
                      label="Degree / Major"
                      value={eduDraft.degree}
                      onChange={(v) => setEduDraft({ ...eduDraft, degree: v })}
                    />
                    <TextField
                      id={`edu-date-${idx}`}
                      label="Year / Date Range"
                      value={eduDraft.date || ""}
                      onChange={(v) => setEduDraft({ ...eduDraft, date: v })}
                    />
                    <TextField
                      id={`edu-loc-${idx}`}
                      label="Location"
                      value={eduDraft.location || ""}
                      onChange={(v) => setEduDraft({ ...eduDraft, location: v })}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingEduIdx(null)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={saveEduEdit}>
                      Save Education
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div key={idx} className="flex items-start justify-between border-b border-ink/8 pb-4 last:border-b-0 last:pb-0">
                <div>
                  <p className="font-semibold text-ink text-base">{inst}</p>
                  <p className="text-sm text-inksoft">{e.degree}</p>
                  <p className="text-xs text-inksoft/80 mt-0.5">
                    {date} {e.location ? `· ${e.location}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => startEduEdit(idx, e)} title="Edit">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEdu(idx)}
                    className="text-inksoft hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Certifications & Achievements */}
      <Card className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-xl font-semibold">Certifications & Honors</h2>
          <span className="text-xs text-inksoft font-medium">
            {certsList.length} items
          </span>
        </div>
        <p className="mb-4 text-xs text-inksoft">
          Industry credentials, hackathon wins, and verified achievements.
        </p>

        <div className="space-y-2 mb-4">
          {certsList.map((cert) => (
            <div key={cert} className="flex items-center justify-between rounded-xl bg-cream/50 px-3.5 py-2.5 text-sm border border-ink/10">
              <span className="font-medium text-ink">{cert}</span>
              <button
                type="button"
                onClick={() => removeCert(cert)}
                className="text-inksoft hover:text-red-600 transition-colors cursor-pointer"
                title="Remove certification"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 max-w-md">
          <input
            id="new-cert"
            type="text"
            value={newCert}
            onChange={(e) => setNewCert(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addCert();
            }}
            placeholder="Add certification or award…"
            className={inputCls}
          />
          <Button size="sm" onClick={addCert}>
            Add
          </Button>
        </div>
      </Card>
    </div>
  );
}
