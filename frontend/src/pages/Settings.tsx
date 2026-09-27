import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Card, DemoBadge, PageHeader } from "../components/ui.tsx";
import { useApp } from "../store/AppContext.tsx";

const inputCls =
  "w-full rounded-2xl border border-ink/15 bg-cream px-4 py-2.5 text-[15px] outline-none focus:border-accent";

function Switch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="flex w-full cursor-pointer items-center justify-between gap-4 py-2 text-left"
    >
      <span className="font-medium text-ink">{label}</span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-accent" : "bg-ink/15"
        }`}
      >
        <motion.span
          className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
        />
      </span>
    </button>
  );
}

export default function Settings() {
  const { profile, updateProfile } = useApp();

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [portfolioPublic, setPortfolioPublic] = useState(false);
  const [modelTier, setModelTier] = useState<"local" | "cloud">("local");
  const [saved, setSaved] = useState(false);
  const savedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setContact = (k: "name" | "email" | "phone" | "location", v: string) =>
    updateProfile({ contact: { ...profile.contact, [k]: v } });

  const save = () => {
    if (savedTimeout.current) clearTimeout(savedTimeout.current);
    setSaved(true);
    savedTimeout.current = setTimeout(() => setSaved(false), 2500);
  };

  const contactFields: { key: "name" | "email" | "phone" | "location"; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "location", label: "Location" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader title="Settings" sub="Preferences and backend configuration." />

      {/* Profile */}
      <Card className="mb-6 p-6 sm:p-8">
        <h2 className="font-display mb-5 text-xl font-semibold">Profile</h2>
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
                type="text"
                value={profile.contact[key]}
                onChange={(e) => setContact(key, e.target.value)}
                className={inputCls}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Preferences */}
      <Card className="mb-6 p-6 sm:p-8">
        <h2 className="font-display mb-3 text-xl font-semibold">Preferences</h2>
        <div className="divide-y divide-ink/8">
          <Switch label="Email notifications" checked={emailNotifs} onChange={setEmailNotifs} />
          <Switch label="Weekly digest" checked={weeklyDigest} onChange={setWeeklyDigest} />
          <Switch
            label="Make portfolio public"
            checked={portfolioPublic}
            onChange={setPortfolioPublic}
          />
        </div>
      </Card>

      {/* Backend */}
      <Card className="mb-6 p-6 sm:p-8">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-xl font-semibold">Backend</h2>
          <DemoBadge />
          <span className="text-xs text-inksoft">UI only</span>
        </div>

        <div className="mb-6">
          <label htmlFor="api-base" className="mb-1.5 block text-sm font-semibold text-ink">
            API base URL
          </label>
          <input
            id="api-base"
            type="text"
            defaultValue="http://localhost:8000"
            className={inputCls}
          />
        </div>

        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-ink">Model tier</legend>
          <div className="space-y-3">
            <label
              htmlFor="tier-local"
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-colors ${
                modelTier === "local" ? "border-accent bg-peach/40" : "border-ink/10"
              }`}
            >
              <input
                id="tier-local"
                type="radio"
                name="model-tier"
                value="local"
                checked={modelTier === "local"}
                onChange={() => setModelTier("local")}
                className="mt-1 accent-accent"
              />
              <span>
                <span className="font-semibold">Local (Qwen3 14B via Ollama)</span>
                <span className="block text-sm text-inksoft">
                  JD reading + matching stay on your machine.
                </span>
              </span>
            </label>
            <label
              htmlFor="tier-cloud"
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-colors ${
                modelTier === "cloud" ? "border-accent bg-peach/40" : "border-ink/10"
              }`}
            >
              <input
                id="tier-cloud"
                type="radio"
                name="model-tier"
                value="cloud"
                checked={modelTier === "cloud"}
                onChange={() => setModelTier("cloud")}
                className="mt-1 accent-accent"
              />
              <span>
                <span className="font-semibold">Cloud</span>
                <span className="block text-sm text-inksoft">
                  Letter generation uses a stronger model.
                </span>
              </span>
            </label>
          </div>
        </fieldset>

        <div className="mt-6 rounded-2xl bg-peach p-5 text-[15px] leading-relaxed">
          <p className="font-semibold">Where the backend plugs in</p>
          <p className="mt-2 text-inksoft">
            POST /v1/pipeline/run {"{ jd_text, profile }"} → streams the 5 stages; GET
            /v1/applications; POST /v1/letters. This demo simulates all of it client-side.
          </p>
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <Button onClick={save}>Save settings</Button>
        <AnimatePresence>
          {saved && (
            <motion.span
              key="saved"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm font-medium text-emerald-700"
              role="status"
            >
              ✓ Saved (demo — no backend connected).
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
