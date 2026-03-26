export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export async function httpJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${text}`);
  }

  return res.json() as Promise<T>;
}

export function logger(data : any, name: string){
    console.log(name, data);
    console.log(name + " json:", JSON.stringify(data));
}