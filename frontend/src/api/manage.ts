import type {
  AlbumResponse,
  AlbumViewResponse,
  ManagedAlbumResponse,
  ManagedPhotoResponse,
  PageResponse,
  PhotoResponse,
  UploadPhotoDraft,
} from "../types/types";
import { httpJson } from "./http";

function trimOrEmpty(value: string) {
  return value.trim();
}

function appendText(formData: FormData, key: string, value: string) {
  const normalized = value.trim();
  if (normalized) {
    formData.append(key, normalized);
  }
}

export function fetchManageablePhotos(slug: string, page = 0, size = 48) {
  const params = new URLSearchParams({
    slug,
    page: String(page),
    size: String(size),
  });

  return httpJson<PageResponse<ManagedPhotoResponse>>(`/api/manage/photos?${params.toString()}`);
}

export function fetchManageableAlbums(slug: string) {
  const params = new URLSearchParams({ slug });
  return httpJson<AlbumViewResponse[]>(`/api/manage/albums?${params.toString()}`);
}

export async function fetchAllManageablePhotos(slug: string) {
  const photos: ManagedPhotoResponse[] = [];
  let page = 0;
  let last = false;

  while (!last) {
    const response = await fetchManageablePhotos(slug, page, 100);
    photos.push(...response.content);
    last = response.last;
    page += 1;
  }

  return photos;
}

export function fetchManagedAlbum(albumId: string) {
  return httpJson<ManagedAlbumResponse>(`/api/manage/albums/${encodeURIComponent(albumId)}`);
}

export function createManagedAlbum(slug: string, input: { title: string; description: string }) {
  const params = new URLSearchParams({
    slug,
    title: trimOrEmpty(input.title),
    description: trimOrEmpty(input.description),
  });

  return httpJson<AlbumResponse>(`/api/manage/albums?${params.toString()}`, {
    method: "POST",
  });
}

export function updateManagedAlbum(albumId: string, input: { title: string; description: string }) {
  const params = new URLSearchParams({
    title: trimOrEmpty(input.title),
    description: trimOrEmpty(input.description),
  });

  return httpJson<AlbumResponse>(`/api/manage/albums/${encodeURIComponent(albumId)}?${params.toString()}`, {
    method: "PUT",
  });
}

export function deleteManagedAlbum(albumId: string) {
  return httpJson<void>(`/api/manage/albums/${encodeURIComponent(albumId)}`, {
    method: "DELETE",
  });
}

export function addPhotoToManagedAlbum(albumId: string, photoId: string) {
  return httpJson<void>(`/api/manage/albums/${encodeURIComponent(albumId)}/photos/${encodeURIComponent(photoId)}`, {
    method: "POST",
  });
}

export function removePhotoFromManagedAlbum(albumId: string, photoId: string) {
  return httpJson<void>(`/api/manage/albums/${encodeURIComponent(albumId)}/photos/${encodeURIComponent(photoId)}`, {
    method: "DELETE",
  });
}

export function reorderManagedAlbumPhotos(albumId: string, photoIds: string[]) {
  return httpJson<void>(`/api/manage/albums/${encodeURIComponent(albumId)}/photos/order`, {
    method: "PUT",
    body: JSON.stringify({ photoIds }),
  });
}

export function uploadManagedPhoto(draft: UploadPhotoDraft, albumId?: string) {
  const formData = new FormData();
  formData.append("file", draft.file);

  appendText(formData, "title", draft.title);
  appendText(formData, "description", draft.description);
  appendText(formData, "country", draft.country);
  appendText(formData, "city", draft.city);

  const captureYear = draft.captureYear.trim();
  if (captureYear) {
    formData.append("captureYear", captureYear);
  }

  if (albumId) {
    formData.append("albumId", albumId);
  }

  return httpJson<PhotoResponse>("/api/manage/photos", {
    method: "POST",
    body: formData,
  });
}

export function updateManagedPhoto(photoId: string, input: {
  title: string;
  description: string;
  country: string;
  city: string;
  captureYear: string;
}) {
  const params = new URLSearchParams({
    title: trimOrEmpty(input.title),
    description: input.description,
    country: input.country,
    city: input.city,
  });

  const captureYear = input.captureYear.trim();
  if (captureYear) {
    params.set("captureYear", captureYear);
  } else {
    params.set("clearCaptureYear", "true");
  }

  return httpJson<PhotoResponse>(`/api/manage/photos/${encodeURIComponent(photoId)}?${params.toString()}`, {
    method: "PUT",
  });
}

export function deleteManagedPhoto(photoId: string) {
  return httpJson<void>(`/api/manage/photos/${encodeURIComponent(photoId)}`, {
    method: "DELETE",
  });
}
