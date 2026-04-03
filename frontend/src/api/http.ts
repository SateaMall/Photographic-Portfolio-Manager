export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

async function readJsonSafe<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text) as T;
}
export async function httpJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${text}`);
  }
  const data = await readJsonSafe<T>(res);
  return data as T;
}

export function logger(data: unknown, name: string) {
    console.log(name, data);
    console.log(name + " json:", JSON.stringify(data));
}
