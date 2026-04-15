import { API_BASE } from "./http";
import type { photoVariant } from "../types/types";



export function photoFileUrl(photoId: string, profileSlug: string, variant: photoVariant = "MEDIUM"): string {
  const params = new URLSearchParams({ variant });
  return `${API_BASE}/api/public/profiles/${encodeURIComponent(profileSlug)}/photos/${encodeURIComponent(photoId)}/file?${params.toString()}`;
}
