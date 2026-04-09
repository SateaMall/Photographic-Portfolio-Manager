import type { AlbumPhotoItem, AlbumViewResponse, MainPhotoResponse, PageResponse, PhotoResponse } from "../types/types";
import { httpJson } from "./http";

function toProfileSlug(profileSlug: string) {
  return encodeURIComponent(profileSlug.toLowerCase());
}


export async function fetchAlbumInfo (albumId: string) {
    return httpJson<AlbumViewResponse>(`/api/public/albums/${encodeURIComponent(albumId)}`);
}

export async function fetchAlbumItems (albumId: string, page = 0, size = 20) {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    return httpJson<PageResponse<AlbumPhotoItem>>(
      `/api/public/albums/${encodeURIComponent(albumId)}/items?${params.toString()}`
    ); //It's easier to pass the AlbumPhotoItem as PhotoResponse to reuse the PhotoCard component, since they have mostly the same fields
}

export async function fetchMainPhoto (profileSlug: string, photoId: string){
    return httpJson<MainPhotoResponse>(
      `/api/public/profiles/${toProfileSlug(profileSlug)}/photos/${encodeURIComponent(photoId)}/details`
    );
}

export async function fetchAlbumItemsAsPhotos(albumId: string, page = 0, size = 20) {
  const data = await fetchAlbumItems(albumId, page, size);

  return {
    ...data,
    content: data.content.map((it) => ({
      id: it.photoId,
      owner: it.owner,
      createdAt: it.addedAt,
      title: it.title,
      description: it.description,
      country: it.country,
      city: it.city,
      captureYear: it.captureYear,
    })),
  } satisfies PageResponse<PhotoResponse>;
}

