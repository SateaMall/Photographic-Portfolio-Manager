
export type AlbumViewResponse = {
  albumId: string;
  firstPhotoId: string | null;
  title: string;
  description: string | null;
  numberOfPhotos: number;
};


export type AlbumPhotoItem = {
  photoId: string,
  owner: Owner,
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
  owner: Owner;
  createdAt: string; // ISO date string
  title: string | null;
  description: string | null;
  country: string | null;
  city: string | null;
  captureYear: number | null;
};

export type MainPhotoResponse = {
  id: string;
  owner: Owner;
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

export type Scope = "SATEA" | "ALEXIS" | "SHARED";

export type Owner = "SATEA" | "ALEXIS";

export type Context = "PERSONAL" | "SHARED";

export type Profile = {
  id: Scope;
  label: string;
  avatar?: { type: "initials"; primaryColor: string; secondaryColor: string };
  linkedIn: string | null;
  instagram: string | null;
  location: string | null;
  bio: string | null;
  email: string | null;

};

export type photoVariant= "ORIGINAL"| "MEDIUM"| "THUMB";