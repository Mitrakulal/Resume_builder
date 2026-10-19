import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, errorMessage } from "../lib/api.ts";
import type {
  Application,
  ApplicationStatus,
  CandidateProfile,
} from "../lib/types.ts";

const APPLICATIONS_STORAGE_KEY = "applywise.applications.v2";

interface AppContextValue {
  profile: CandidateProfile | null;
  profileError: string | null;
  isLoadingProfile: boolean;
  reloadProfile: () => Promise<void>;
  updateProfile: (patch: Partial<CandidateProfile>) => void;
  saveProfileToBackend: () => Promise<void>;

  applications: Application[];
  getApplication: (id: string) => Application | undefined;
  createApplication: (input: {
    jobId: string;
    jdText: string;
    role?: string;
    company?: string;
  }) => Application;
  updateApplication: (id: string, patch: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function isApplication(value: unknown): value is Application {
  if (!value || typeof value !== "object") return false;
  const app = value as Partial<Application>;
  return (
    typeof app.id === "string" &&
    typeof app.jobId === "string" &&
    typeof app.jdText === "string" &&
    (app.status === "pipeline" || app.status === "matched" || app.status === "failed") &&
    Array.isArray(app.completedNodes)
  );
}

function loadApplications(): Application[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(APPLICATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isApplication).map((app) => ({
      ...app,
      summary: app.summary ?? {},
      updatedAt: app.updatedAt ?? app.createdAt ?? new Date().toISOString(),
      createdAt: app.createdAt ?? new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

function persistApplications(applications: Application[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(applications));
  } catch {
    // Storage can fail in private mode or when the quota is full. The app
    // still works for the current session, so don't break the page.
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [applications, setApplications] = useState<Application[]>(loadApplications);

  const reloadProfile = useCallback(async () => {
    setIsLoadingProfile(true);
    setProfileError(null);
    try {
      const data = await api.getProfile();
      setProfile(data);
    } catch (error) {
      setProfileError(errorMessage(error));
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    void reloadProfile();
  }, [reloadProfile]);

  useEffect(() => {
    persistApplications(applications);
  }, [applications]);

  const updateProfile = useCallback((patch: Partial<CandidateProfile>) => {
    setProfile((previous) => (previous ? { ...previous, ...patch } : previous));
  }, []);

  const saveProfileToBackend = useCallback(async () => {
    if (!profile) throw new Error("The profile has not loaded yet.");
    await api.saveProfile(profile);
  }, [profile]);

  const getApplication = useCallback(
    (id: string) => applications.find((application) => application.id === id),
    [applications],
  );

  const createApplication = useCallback(
    (input: { jobId: string; jdText: string; role?: string; company?: string }) => {
      const now = new Date().toISOString();
      const application: Application = {
        id: input.jobId,
        jobId: input.jobId,
        role: input.role?.trim() || "Tailored application",
        company: input.company?.trim() || "",
        jdText: input.jdText,
        status: "pipeline",
        createdAt: now,
        updatedAt: now,
        completedNodes: [],
        summary: {},
      };
      setApplications((previous) => [
        application,
        ...previous.filter((existing) => existing.id !== application.id),
      ]);
      return application;
    },
    [],
  );

  const updateApplication = useCallback((id: string, patch: Partial<Application>) => {
    setApplications((previous) =>
      previous.map((application) => {
        if (application.id !== id) return application;
        return {
          ...application,
          ...patch,
          summary: patch.summary
            ? { ...application.summary, ...patch.summary }
            : application.summary,
          updatedAt: patch.updatedAt ?? new Date().toISOString(),
        };
      }),
    );
  }, []);

  const deleteApplication = useCallback((id: string) => {
    setApplications((previous) => previous.filter((application) => application.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      profile,
      profileError,
      isLoadingProfile,
      reloadProfile,
      updateProfile,
      saveProfileToBackend,
      applications,
      getApplication,
      createApplication,
      updateApplication,
      deleteApplication,
    }),
    [
      profile,
      profileError,
      isLoadingProfile,
      reloadProfile,
      updateProfile,
      saveProfileToBackend,
      applications,
      getApplication,
      createApplication,
      updateApplication,
      deleteApplication,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}

export function statusColor(status: ApplicationStatus): string {
  switch (status) {
    case "matched":
      return "bg-emerald-100 text-emerald-800";
    case "pipeline":
      return "bg-amber-100 text-amber-800";
    case "failed":
      return "bg-red-100 text-red-800";
  }
}
