import { useEffect, useState } from "react";
import { Button, Card, PageHeader } from "../components/ui.tsx";
import { errorMessage, getApiBase, resetApiBase, setApiBase } from "../lib/api.ts";
import { useApp } from "../store/AppContext.tsx";

const inputCls =
  "w-full rounded-2xl border border-ink/15 bg-cream px-4 py-2.5 text-[15px] outline-none focus:border-accent";

export default function Settings() {
  const {
    profile,
    updateProfile,
    saveProfileToBackend,
    isLoadingProfile,
    profileError,
    reloadProfile,
  } = useApp();

  const [apiBaseValue, setApiBaseValue] = useState(getApiBase);
  const [status, setStatus] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(null), 6000);
    return () => clearTimeout(timer);
  }, [status]);

  if (isLoadingProfile) {
    return (
      <div className="flex h-64 items-center justify-center text-inksoft">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span>Loading profile from backend...</span>
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

  const setContact = (key: "name" | "email" | "phone" | "location", value: string) =>
    updateProfile({ personal_info: { ...profile.personal_info, [key]: value } });

  const saveProfile = async () => {
    setSavingProfile(true);
    setStatus(null);
    try {
      await saveProfileToBackend();
      setStatus("Profile saved to master_profile.json.");
    } catch (error) {
      setStatus(`Could not save profile: ${errorMessage(error)}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const saveApiUrl = (reload: boolean) => {
    try {
      const normalized = setApiBase(apiBaseValue);
      setApiBaseValue(normalized);
      setStatus("API URL saved for this browser.");
      if (reload) window.location.reload();
    } catch (error) {
      setStatus(errorMessage(error));
    }
  };

  const resetApiUrl = () => {
    resetApiBase();
    const normalized = getApiBase();
    setApiBaseValue(normalized);
    setStatus("API URL reset to the default.");
  };

  const contactFields: { key: "name" | "email" | "phone" | "location"; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "location", label: "Location" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Settings"
        sub="Profile, backend connection and data storage for this workspace."
      />

      {status && (
        <div
          role="status"
          className="mb-5 rounded-2xl border border-ink/10 bg-peach/60 px-4 py-3 text-sm text-ink"
        >
          {status}
        </div>
      )}

      <Card className="mb-6 p-6 sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">Profile</h2>
            <p className="mt-1 text-sm text-inksoft">
              Saved to <code>master_profile.json</code> by the FastAPI backend.
            </p>
          </div>
          <Button onClick={saveProfile} disabled={savingProfile}>
            {savingProfile ? "Saving…" : "Save profile"}
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {contactFields.map(({ key, label }) => (
            <div key={key}>
              <label
                htmlFor={`settings-${key}`}
                className="mb-1.5 block text-sm font-semibold text-ink"
              >
                {label}
              </label>
              <input
                id={`settings-${key}`}
                type={key === "email" ? "email" : "text"}
                value={profile.personal_info[key] ?? ""}
                onChange={(event) => setContact(key, event.target.value)}
                className={inputCls}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-6 p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">Backend connection</h2>
        <p className="mt-1 text-sm text-inksoft">
          The frontend calls this URL for the profile, pipeline stream and PDF.
        </p>

        <div className="mt-5">
          <label htmlFor="api-base" className="mb-1.5 block text-sm font-semibold text-ink">
            API base URL
          </label>
          <input
            id="api-base"
            type="url"
            value={apiBaseValue}
            onChange={(event) => setApiBaseValue(event.target.value)}
            className={inputCls}
            placeholder="http://127.0.0.1:8000"
          />
          <p className="mt-2 text-xs text-inksoft">
            Stored in this browser. Use <strong>Save &amp; reload</strong> to reconnect the profile
            and application links to the new backend.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button size="sm" onClick={() => saveApiUrl(false)}>
            Save URL
          </Button>
          <Button size="sm" variant="outline" onClick={() => saveApiUrl(true)}>
            Save &amp; reload
          </Button>
          <Button size="sm" variant="ghost" onClick={resetApiUrl}>
            Reset to default
          </Button>
        </div>
      </Card>

      <Card className="mb-6 p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">Model configuration</h2>
        <p className="mt-2 text-sm leading-relaxed text-inksoft">
          Model selection is a backend setting. Set the model name and provider credentials in the
          backend <code>.env</code>, then restart FastAPI. The current <code>match</code> node uses
          deterministic skill comparison; the <code>generate_content</code> node uses the configured
          LLM.
        </p>
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">Where data lives</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-inksoft">Master profile</dt>
            <dd className="font-medium">
              <code>master_profile.json</code> (backend)
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-inksoft">Applications</dt>
            <dd className="font-medium">
              <code>localStorage</code> in this browser
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-inksoft">Resume PDF</dt>
            <dd className="font-medium">
              Job-specific endpoint on the backend
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-inksoft">Job state</dt>
            <dd className="font-medium">In-memory on the FastAPI process</dd>
          </div>
        </dl>
        <p className="mt-4 rounded-2xl bg-peach/60 px-4 py-3 text-[13px] leading-relaxed text-inksoft">
          Applications survive a browser reload because they are stored locally. Backend jobs do
          not survive a FastAPI restart yet.
        </p>
      </Card>
    </div>
  );
}
