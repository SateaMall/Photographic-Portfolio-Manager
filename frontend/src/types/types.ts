
export type AlbumViewResponse = {
  albumId: string;
  firstPhotoId: string | null;
  title: string;
  description: string | null;
  numberOfPhotos: number;
};

export type AlbumResponse = {
  id: string;
  title: string;
  description: string | null;
};


export type AlbumPhotoItem = {
  photoId: string,
  owner: string,
  title: string | null,
  description: string | null;
  country: string | null;
  city: string | null;
  captureYear: number | null;
  addedAt: string;
  height: number;
  width: number;
}


export type PageResponse<T> = {
  content: T[];
  number: number;        // current page (0-based)
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type PhotoResponse = {
  id: string;
  owner: string;
  createdAt: string; // ISO date string
  title: string | null;
  description: string | null;
  country: string | null;
  city: string | null;
  captureYear: number | null;
};

export type MainPhotoResponse = {
  id: string;
  owner: string;
  createdAt: string; // ISO date string
  title: string | null;
  description: string | null;
  country: string | null;
  city: string | null;
  captureYear: number | null;
  themes: Theme[] | null;
  height: number;
  width: number;

};

export type Theme =
  | "STREET_SOCIETY"
  | "PEOPLE_EMOTION"
  | "NATURE_ENVIRONMENT"
  | "ARCHITECTURE_SPACES"
  | "MOOD_ATMOSPHERE"
  | "CONCEPTUAL_ARTISTIC"
  | "DOCUMENTARY_SOCIAL";


export type PublicProfileResponse = {
  slug: string;
  displayName: string;
  bio: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  publicEmail: string | null;
  linkedIn: string | null;
  instagram: string | null;
};

export type photoVariant= "ORIGINAL"| "MEDIUM"| "THUMB";

export type ManagedPhotoResponse = {
  id: string;
  createdAt: string;
  title: string | null;
  description: string | null;
  country: string | null;
  city: string | null;
  captureYear: number | null;
};

export type ManagedAlbumResponse = {
  albumId: string;
  title: string;
  description: string | null;
  photos: ManagedPhotoResponse[];
};

export type UploadPhotoDraft = {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  description: string;
  country: string;
  city: string;
  captureYear: string;
};
