import type { Scope, Owner, Theme } from "../types/types";

export type PhotoResponse = {
  id: string;
  owner: Owner;
  albumId?: string | null;
  contentType?: string;
  sizeBytes?: number;
  createdAt?: string;
  fileUrl?: string;
};

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

async function readJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T | null; raw: any }> {
  const res = await fetch(`${BASE}${path}`, init);
  const raw = await readJsonSafe(res);
  return { ok: res.ok, status: res.status, data: (raw as T) ?? null, raw };
}

/** POST /api/admin/photos (multipart) */
export async function uploadPhoto(args: {
  file: File;
  owner: Owner;
  albumId?: string;
  themes?: Theme[];
}) {
  const form = new FormData();
  form.append("file", args.file);

  // RequestParam can be passed via query string safely
  const params = new URLSearchParams();
  params.set("owner", args.owner);
  if (args.albumId) params.set("albumId", args.albumId);
  (args.themes ?? []).forEach((t) => params.append("themes", t));

  return request<PhotoResponse>(`/api/admin/photos?${params.toString()}`, {
    method: "POST",
    body: form,
  });
}

/** DELETE /api/admin/photos/{id} */
export async function deletePhoto(id: string) {
  return request<void>(`/api/admin/photos/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/** POST /api/admin/albums?title&scope&description */
export async function createAlbum(args: {
  title: string;
  scope: Scope;
  description?: string;
}) {
  const params = new URLSearchParams();
  params.set("title", args.title);
  params.set("scope", args.scope);
  if (args.description) params.set("description", args.description);

  return request<any>(`/api/admin/albums?${params.toString()}`, {
    method: "POST",
  });
}

/**
 * Your backend currently has:
 *  @PutMapping("/{id}") but method takes @RequestParam UUID id
 * So we satisfy BOTH: path + query param id.
 */
export async function updateAlbum(args: {
  id: string;
  title: string;
  scope: Scope;
  description?: string;
}) {
  const params = new URLSearchParams();
  params.set("id", args.id);
  params.set("title", args.title);
  params.set("scope", args.scope);
  if (args.description) params.set("description", args.description);

  return request<any>(
    `/api/admin/albums/${encodeURIComponent(args.id)}?${params.toString()}`,
    { method: "PUT" }
  );
}

/**
 * Your backend currently has:
 *  @DeleteMapping("/{id}") but method takes @RequestParam UUID id
 * So we satisfy BOTH: path + query param id.
 */
export async function deleteAlbum(id: string) {
  const params = new URLSearchParams();
  params.set("id", id);

  return request<void>(
    `/api/admin/albums/${encodeURIComponent(id)}?${params.toString()}`,
    { method: "DELETE" }
  );
}

/**
 * Your backend currently has:
 *  @PostMapping("/{albumId}/photos/{photoId}")
 *  but method takes @RequestParam UUID photoID, @RequestParam UUID albumID
 * So we satisfy BOTH: path variables + request params (photoID/albumID).
 */
export async function addPhotoToAlbum(args: {
  albumId: string;
  photoId: string;
  position?: number;
}) {
  const params = new URLSearchParams();
  params.set("photoID", args.photoId); // matches your controller param name
  params.set("albumID", args.albumId); // matches your controller param name
  if (typeof args.position === "number") params.set("position", String(args.position));

  return request<void>(
    `/api/admin/albums/${encodeURIComponent(args.albumId)}/photos/${encodeURIComponent(
      args.photoId
    )}?${params.toString()}`,
    { method: "POST" }
  );
}

/** DELETE /api/admin/albums/{albumId}/photos/{photoId} */
export async function removePhotoFromAlbum(albumId: string, photoId: string) {
  return request<void>(
    `/api/admin/albums/${encodeURIComponent(albumId)}/photos/${encodeURIComponent(photoId)}`,
    { method: "DELETE" }
  );
}

export type AlbumPhotoItem = {
  photoId: string;
  owner: Owner;
  fileUrl: string;
  position: number;
  addedAt: string;
};

export type AlbumResponse = {
  id: string;
  title: string;
  scope: Scope;
  description: string | null;
  createdAt: string;
  photos: AlbumPhotoItem[];
};

export async function getAlbum(id: string) {
  return request<AlbumResponse>(`/api/albums/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}