import type { AlbumViewResponse ,AlbumPhotoItem, MainPhotoResponse, PhotoResponse, Scope, PageResponse} from "../types/types";
import { httpJson, logger } from "./http";


export async function fetchAlbumInfo (albumId: string) {
    const data = await httpJson<AlbumViewResponse>(`/api/Photobrowser/albumDetails/${albumId}`);
    //logger(data, "Album Info");
    return data;
}

export async function fetchAlbumItems (albumId: string, page = 0, size = 20) {
    const data = await httpJson<PageResponse<AlbumPhotoItem>>(`/api/Photobrowser/albumItems/${albumId}?page=${page}&size=${size}`); //It's easier to pass the AlbumPhotoItem as PhotoResponse to reuse the PhotoCard component, since they have mostly the same fields
    //logger(data, "Album Items");
    return data;
}

export async function fetchMainPhoto (photoId: string){
    const data = await httpJson<MainPhotoResponse>(`/api/Photobrowser/mainPhoto/${photoId}`)
    //logger(data, "Main Photo");
    return data;
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

