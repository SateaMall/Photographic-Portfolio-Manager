import type { PublicProfileResponse } from "../types/types";
import { httpJson } from "./http";

function normalizeProfileSlug(slug: string) {
  return slug.trim().toLowerCase();
}

function toProfilePath(slug: string) {
  return encodeURIComponent(normalizeProfileSlug(slug));
}

export function fetchPublicProfile(slug: string) {
  return httpJson<PublicProfileResponse>(`/api/public/profiles/${toProfilePath(slug)}`);
}
