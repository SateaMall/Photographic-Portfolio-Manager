import { API_BASE } from "./http";
import type { photoVariant } from "../types/types";

export function photoFileUrl(photoId: string,variant: photoVariant = "MEDIUM"): string {
  return `${API_BASE}/api/photos/${photoId}/file?variant=${variant}`;
}
