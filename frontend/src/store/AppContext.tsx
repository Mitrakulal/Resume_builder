import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import {
  demoApplications,
  demoProfile,
  matchData,
  type Application,
  type ApplicationStatus,
  type CandidateProfile,
  type Tone,
} from "../data/demo.ts";

interface AppContextValue {
  profile: CandidateProfile;
  updateProfile: (patch: Partial<CandidateProfile>) => void;
  saveProfileToBackend: () => Promise<void>;
  applications: Application[];
  getApplication: (id: string) => Application | undefined;
  createApplication: (role: string, company: string, jdId: string) => Application;
  updateApplication: (id: string, patch: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
  tone: Tone;
  setTone: (t: Tone) => void;
  isLoadingProfile: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

let appCounter = 100;

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CandidateProfile>(demoProfile);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [applications, setApplications] = useState<Application[]>(demoApplications);
  const [tone, setTone] = useState<Tone>("Professional");

  // Fetch profile on mount
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setIsLoadingProfile(false);
      })
      .catch((err) => {
        console.error("Error loading profile from backend:", err);
        setIsLoadingProfile(false);
      });
  }, []);

  const updateProfile = useCallback((patch: Partial<CandidateProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const saveProfileToBackend = useCallback(async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to save profile");
      }
      alert("Profile saved to backend successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Error saving profile: " + err.message);
    }
  }, [profile]);

  const getApplication = useCallback(
    (id: string) => applications.find((a) => a.id === id),
    [applications],
  );

  const createApplication = useCallback((role: string, company: string, jdId: string, customId?: string) => {
    const app: Application = {
      id: customId || `app-${Date.now()}-${appCounter++}`,
      role,
      company,
      jdId,
      tone: "Professional",
      status: "draft",
      matchScore: matchData[jdId]?.score ?? 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setApplications((prev) => [app, ...prev]);
    return app;
  }, []);

  const updateApplication = useCallback((id: string, patch: Partial<Application>) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const deleteApplication = useCallback((id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      profile,
      updateProfile,
      applications,
      getApplication,
      createApplication,
      updateApplication,
      deleteApplication,
      tone,
      setTone,
      saveProfileToBackend,
      isLoadingProfile,
    }),
    [profile, applications, tone, updateProfile, getApplication, createApplication, updateApplication, deleteApplication, saveProfileToBackend, isLoadingProfile],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function statusColor(status: ApplicationStatus): string {
  switch (status) {
    case "ready":
      return "bg-emerald-100 text-emerald-800";
    case "letter":
      return "bg-sky-100 text-sky-800";
    case "matched":
      return "bg-violet-100 text-violet-800";
    case "pipeline":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-stone-200 text-stone-700";
  }
}
