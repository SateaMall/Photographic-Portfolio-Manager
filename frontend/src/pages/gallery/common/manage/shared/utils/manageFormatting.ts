import { getCountryDisplayName } from "../../../../../../components/forms/countryData";
import type { ManagedPhotoResponse } from "../../../../../../types/types";

export function formatPhotoMeta(photo: ManagedPhotoResponse) {
  const parts = [
    photo.city,
    getCountryDisplayName(photo.country),
    photo.captureYear ? String(photo.captureYear) : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" • ") : "No metadata yet";
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export function formatPhotoTitle(photo: ManagedPhotoResponse) {
  return photo.title?.trim() || "Untitled";
}
