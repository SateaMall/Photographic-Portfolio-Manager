import { httpJson } from "./http";
import type { AlbumViewResponse, PageResponse, PhotoResponse } from "../types/types";

function toProfileSlug(profileSlug: string) {
  return encodeURIComponent(profileSlug.toLowerCase());
}


export async function fetchAlbums(profileSlug: string) {
  return httpJson<AlbumViewResponse[]>(`/api/public/profiles/${toProfileSlug(profileSlug)}/albums`);
}

export async function fetchPhotos(profileSlug: string, page = 0, size = 20, photoId?: string) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (photoId) {
    params.set("photoId", photoId);
  }

  return httpJson<PageResponse<PhotoResponse>>(
    `/api/public/profiles/${toProfileSlug(profileSlug)}/photos?${params.toString()}`
  );
}
