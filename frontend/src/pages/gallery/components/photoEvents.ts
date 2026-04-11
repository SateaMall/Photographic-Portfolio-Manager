import type { PhotoResponse } from "../../../types/types";

export const PHOTO_MANAGED_EVENT = "photo-gallery:photo-managed";

export type PhotoManagedDetail =
  | {
      type: "updated";
      photo: PhotoResponse;
    }
  | {
      type: "deleted";
      photoId: string;
    };

export function emitPhotoUpdated(photo: PhotoResponse) {
  window.dispatchEvent(new CustomEvent<PhotoManagedDetail>(PHOTO_MANAGED_EVENT, {
    detail: { type: "updated", photo },
  }));
}

export function emitPhotoDeleted(photoId: string) {
  window.dispatchEvent(new CustomEvent<PhotoManagedDetail>(PHOTO_MANAGED_EVENT, {
    detail: { type: "deleted", photoId },
  }));
}
