import { useState } from "react";
import { Button, Card, Chip, PageHeader } from "../components/ui.tsx";
import { useApp } from "../store/AppContext.tsx";
import type {
  CandidateProfile,
  ExperienceItem,
  ProjectItem,
} from "../data/demo.ts";

/* --------------------------- Local helpers --------------------------- */

const inputCls =
  "w-full rounded-2xl border border-ink/15 bg-cream px-4 py-2.5 text-[15px] outline-none focus:border-accent";

function TextField({
  id,
  label,
  value,
  onChange,
  textarea = false,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
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

/** Edit / Save / Cancel button cluster for an inline editor. */
function EditToggle({
  editing,
  onEdit,
  onSave,
  onCancel,
}: {
  editing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  if (!editing) {
    return (
      <Button variant="outline" size="sm" onClick={onEdit}>
        Edit
      </Button>
    );
  }
  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={onSave}>
        Save
      </Button>
      <Button variant="ghost" size="sm" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}

/* ------------------------------- Page -------------------------------- */

export default function Portfolio() {
  const { profile, updateProfile } = useApp();
  const [editingExp, setEditingExp] = useState<string | null>(null);
  const [expDraft, setExpDraft] = useState<ExperienceItem | null>(null);
  const [editingProj, setEditingProj] = useState<string | null>(null);
  const [projDraft, setProjDraft] = useState<ProjectItem | null>(null);
  const [newSkill, setNewSkill] = useState("");

  const patch = (p: Partial<CandidateProfile>) => updateProfile(p);

  /* ------------------------------ Contact ----------------------------- */

  const setContact = (k: keyof CandidateProfile["contact"], v: string | string[]) =>
    patch({ contact: { ...profile.contact, [k]: v } });

  const contactFields: { key: "name" | "email" | "phone" | "location"; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "location", label: "Location" },
  ];

  /* ---------------------------- Experience ---------------------------- */

  const startExpEdit = (item: ExperienceItem) => {
    setEditingExp(item.id);
    setExpDraft({ ...item, skillsUsed: [...item.skillsUsed] });
  };
  const saveExpEdit = () => {
    if (!editingExp || !expDraft) return;
    patch({
      experience: profile.experience.map((e) => (e.id === editingExp ? expDraft : e)),
    });
    setEditingExp(null);
    setExpDraft(null);
  };

  /* ----------------------------- Projects ----------------------------- */

  const startProjEdit = (item: ProjectItem) => {
    setEditingProj(item.id);
    setProjDraft({ ...item, skillsUsed: [...item.skillsUsed] });
  };
  const saveProjEdit = () => {
    if (!editingProj || !projDraft) return;
    patch({
      projects: profile.projects.map((p) => (p.id === editingProj ? projDraft : p)),
    });
    setEditingProj(null);
    setProjDraft(null);
  };

  /* ------------------------------- Skills ------------------------------ */

  const addSkill = () => {
    const s = newSkill.trim();
    if (!s || profile.skills.includes(s)) return;
    patch({ skills: [...profile.skills, s] });
    setNewSkill("");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Portfolio"
        sub="Your source of truth. The pipeline only ever uses what's here."
        actions={
          <span className="text-sm text-inksoft">Edits save locally for this demo session</span>
        }
      />

      {/* Contact */}
      <Card className="mb-6 p-6 sm:p-8">
        <h2 className="font-display mb-5 text-xl font-semibold">Contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {contactFields.map(({ key, label }) => (
            <TextField
              key={key}
              id={`contact-${key}`}
              label={label}
              value={profile.contact[key]}
              onChange={(v) => setContact(key, v)}
            />
          ))}
        </div>
        <div className="mt-4">
          <TextField
            id="contact-links"
            label="Links (comma-separated)"
            value={profile.contact.links.join(", ")}
            onChange={(v) =>
              setContact(
                "links",
                v
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
          />
        </div>
      </Card>

      {/* Experience */}
      <section aria-label="Experience" className="mb-6">
        <h2 className="font-display mb-4 text-xl font-semibold">Experience</h2>
        <div className="space-y-4">
          {profile.experience.map((item) => (
            <Card key={item.id} className="p-6 sm:p-8">
              {editingExp === item.id && expDraft ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                      id={`exp-title-${item.id}`}
                      label="Title"
                      value={expDraft.title}
                      onChange={(v) => setExpDraft({ ...expDraft, title: v })}
                    />
                    <TextField
                      id={`exp-org-${item.id}`}
                      label="Organization"
                      value={expDraft.organization}
                      onChange={(v) => setExpDraft({ ...expDraft, organization: v })}
                    />
                    <TextField
                      id={`exp-start-${item.id}`}
                      label="Start date"
                      value={expDraft.startDate}
                      onChange={(v) => setExpDraft({ ...expDraft, startDate: v })}
                    />
                    <TextField
                      id={`exp-end-${item.id}`}
                      label="End date"
                      value={expDraft.endDate}
                      onChange={(v) => setExpDraft({ ...expDraft, endDate: v })}
                    />
                  </div>
                  <TextField
                    id={`exp-desc-${item.id}`}
                    label="Description"
                    textarea
                    value={expDraft.description}
                    onChange={(v) => setExpDraft({ ...expDraft, description: v })}
                  />
                  <TextField
                    id={`exp-skills-${item.id}`}
                    label="Skills (comma-separated)"
                    value={expDraft.skillsUsed.join(", ")}
                    onChange={(v) =>
                      setExpDraft({
                        ...expDraft,
                        skillsUsed: v
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                  <EditToggle
                    editing
                    onEdit={() => {}}
                    onSave={saveExpEdit}
                    onCancel={() => {
                      setEditingExp(null);
                      setExpDraft(null);
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm text-inksoft">
                      {item.organization} · {item.startDate} – {item.endDate}
                    </p>
                    <p className="mt-3 leading-relaxed text-ink">{item.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.skillsUsed.map((s) => (
                        <Chip key={s}>{s}</Chip>
                      ))}
                    </div>
                  </div>
                  <EditToggle
                    editing={false}
                    onEdit={() => startExpEdit(item)}
                    onSave={() => {}}
                    onCancel={() => {}}
                  />
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section aria-label="Projects" className="mb-6">
        <h2 className="font-display mb-4 text-xl font-semibold">Projects</h2>
        <div className="space-y-4">
          {profile.projects.map((item) => (
            <Card key={item.id} className="p-6 sm:p-8">
              {editingProj === item.id && projDraft ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                      id={`proj-name-${item.id}`}
                      label="Name"
                      value={projDraft.name}
                      onChange={(v) => setProjDraft({ ...projDraft, name: v })}
                    />
                    <TextField
                      id={`proj-date-${item.id}`}
                      label="Date"
                      value={projDraft.date}
                      onChange={(v) => setProjDraft({ ...projDraft, date: v })}
                    />
                  </div>
                  <TextField
                    id={`proj-link-${item.id}`}
                    label="Link"
                    value={projDraft.link ?? ""}
                    onChange={(v) => setProjDraft({ ...projDraft, link: v })}
                  />
                  <TextField
                    id={`proj-desc-${item.id}`}
                    label="Description"
                    textarea
                    value={projDraft.description}
                    onChange={(v) => setProjDraft({ ...projDraft, description: v })}
                  />
                  <TextField
                    id={`proj-skills-${item.id}`}
                    label="Skills (comma-separated)"
                    value={projDraft.skillsUsed.join(", ")}
                    onChange={(v) =>
                      setProjDraft({
                        ...projDraft,
                        skillsUsed: v
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                  <EditToggle
                    editing
                    onEdit={() => {}}
                    onSave={saveProjEdit}
                    onCancel={() => {
                      setEditingProj(null);
                      setProjDraft(null);
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-sm text-inksoft">{item.date}</p>
                    <p className="mt-3 leading-relaxed text-ink">{item.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.skillsUsed.map((s) => (
                        <Chip key={s}>{s}</Chip>
                      ))}
                    </div>
                  </div>
                  <EditToggle
                    editing={false}
                    onEdit={() => startProjEdit(item)}
                    onSave={() => {}}
                    onCancel={() => {}}
                  />
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Skills */}
      <Card className="mb-6 p-6 sm:p-8">
        <h2 className="font-display mb-5 text-xl font-semibold">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((s) => (
            <Chip key={s}>
              {s}
              <button
                type="button"
                aria-label={`Remove skill ${s}`}
                onClick={() => patch({ skills: profile.skills.filter((x) => x !== s) })}
                className="ml-1 cursor-pointer rounded-full px-1 leading-none text-inksoft hover:text-red-700"
              >
                ×
              </button>
            </Chip>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            id="new-skill"
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addSkill();
            }}
            placeholder="Add a skill…"
            aria-label="New skill"
            className={`${inputCls} max-w-xs`}
          />
          <Button size="sm" onClick={addSkill}>
            Add
          </Button>
        </div>
      </Card>

      {/* Education (read-only) */}
      <Card className="p-6 sm:p-8">
        <h2 className="font-display mb-5 text-xl font-semibold">Education</h2>
        <ul className="divide-y divide-ink/8">
          {profile.education.map((e) => (
            <li key={e.id} className="py-4 first:pt-0 last:pb-0">
              <p className="font-semibold">{e.degree}</p>
              <p className="text-sm text-inksoft">
                {e.institution} · {e.startDate} – {e.endDate}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
