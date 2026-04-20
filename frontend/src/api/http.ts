export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

type ErrorResponse = {
  message?: string;
};

function looksLikeHtml(body: string) {
  const normalized = body.trimStart().toLowerCase();
  return normalized.startsWith("<!doctype html") || normalized.startsWith("<html");
}

export class HttpError extends Error {
  status: number;
  statusText: string;
  body: string;

  constructor(status: number, statusText: string, message: string, body: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

async function readJsonSafe<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text) as T;
}

function readErrorMessage(status: number, statusText: string, body: string) {
  if (status === 413) {
    return "Upload failed: payload too large. Maximum allowed size is 15MB.";
  }

  if (!body) {
    return `${status} ${statusText}`;
  }

  try {
    const parsed = JSON.parse(body) as ErrorResponse;
    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return parsed.message;
    }
  } catch {
    // Fall back to the raw text body when the response is not JSON.
  }

  if (looksLikeHtml(body)) {
    return `${status} ${statusText}`;
  }

  return body;
}

export async function httpJson<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormDataBody = init?.body instanceof FormData;

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(!isFormDataBody && init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new HttpError(
      res.status,
      res.statusText,
      readErrorMessage(res.status, res.statusText, text),
      text,
    );
  }
  const data = await readJsonSafe<T>(res);
  return data as T;
}

export function logger(data: unknown, name: string) {
    console.log(name, data);
    console.log(name + " json:", JSON.stringify(data));
}
