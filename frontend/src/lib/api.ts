import type { CandidateProfile, TailorResult } from "./types.ts";

const DEFAULT_API_BASE = "http://127.0.0.1:8000";
const API_BASE_STORAGE_KEY = "applywise.apiBase.v1";

export class ApiError extends Error {
  status: number;
  detail?: unknown;

  constructor(message: string, status = 0, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

/** The API base can be overridden from Settings and is persisted locally. */
export function getApiBase(): string {
  const envBase = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL ?? "");
  if (typeof window === "undefined") return envBase || DEFAULT_API_BASE;

  const saved = window.localStorage.getItem(API_BASE_STORAGE_KEY);
  return normalizeBaseUrl(saved || envBase || DEFAULT_API_BASE);
}

export function setApiBase(value: string): string {
  const normalized = normalizeBaseUrl(value);
  if (!/^https?:\/\//i.test(normalized)) {
    throw new Error("API URL must start with http:// or https://");
  }
  window.localStorage.setItem(API_BASE_STORAGE_KEY, normalized);
  return normalized;
}

export function resetApiBase(): void {
  window.localStorage.removeItem(API_BASE_STORAGE_KEY);
}

function detailMessage(detail: unknown, fallback: string): string {
  if (typeof detail === "string" && detail.trim()) return detail;
  if (detail && typeof detail === "object") {
    const maybe = detail as { detail?: unknown; message?: unknown };
    if (typeof maybe.detail === "string") return maybe.detail;
    if (typeof maybe.message === "string") return maybe.message;
  }
  return fallback;
}

async function request<T>(path: string, init: RequestInit = {}, timeoutMs = 30_000): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${getApiBase()}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });

    const text = await response.text();
    let body: unknown = undefined;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }

    if (!response.ok) {
      const detail = body && typeof body === "object" ? (body as { detail?: unknown }).detail : body;
      throw new ApiError(
        detailMessage(detail, `Request failed with status ${response.status}`),
        response.status,
        detail,
      );
    }

    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("The backend did not respond in time.", 0);
    }
    throw new ApiError(
      `Could not reach the backend at ${getApiBase()}. Make sure FastAPI is running.`,
      0,
    );
  } finally {
    clearTimeout(timeout);
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}

export const api = {
  getProfile(): Promise<CandidateProfile> {
    return request<CandidateProfile>("/api/profile");
  },

  saveProfile(profile: CandidateProfile): Promise<{ status: string; message: string }> {
    return request<{ status: string; message: string }>("/api/profile", {
      method: "POST",
      body: JSON.stringify(profile),
    });
  },

  startTailor(jdText: string): Promise<{ job_id: string; status: string; message: string }> {
    return request<{ job_id: string; status: string; message: string }>("/api/tailor", {
      method: "POST",
      body: JSON.stringify({ jd_text: jdText }),
    });
  },

  /**
   * Forward-compatible with the result endpoint described in the audit.
   * The current backend returns 404, so callers receive null and can show
   * the data they already captured from progress events.
   */
  async getTailorResult(jobId: string): Promise<TailorResult | null> {
    try {
      return await request<TailorResult>(`/api/tailor/${encodeURIComponent(jobId)}/result`);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
        return null;
      }
      throw error;
    }
  },

  streamUrl(jobId: string): string {
    return `${getApiBase()}/api/tailor/${encodeURIComponent(jobId)}/stream`;
  },

  pdfUrl(jobId: string): string {
    return `${getApiBase()}/api/tailor/${encodeURIComponent(jobId)}/pdf`;
  },

  health(): Promise<{ status: string; service: string }> {
    return request<{ status: string; service: string }>("/api/health", {}, 5_000);
  },
};
