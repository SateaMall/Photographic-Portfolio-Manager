import type { PublicProfileResponse } from "../../../types/types";

export const PROFILE_MANAGED_EVENT = "photo-gallery:profile-managed";

export type ProfileManagedDetail = {
  profile: PublicProfileResponse;
};

export function emitProfileUpdated(profile: PublicProfileResponse) {
  window.dispatchEvent(new CustomEvent<ProfileManagedDetail>(PROFILE_MANAGED_EVENT, {
    detail: { profile },
  }));
}
