import type { PublicProfileResponse } from "../../../../../../../types/types";

export type ProfileDraft = {
  displayName: string;
  bio: string;
  primaryColor: string;
  secondaryColor: string;
  publicEmail: string;
  linkedIn: string;
  instagram: string;
};

export function draftFromProfile(profile: PublicProfileResponse): ProfileDraft {
  return {
    displayName: profile.displayName,
    bio: profile.bio ?? "",
    primaryColor: profile.primaryColor ?? "",
    secondaryColor: profile.secondaryColor ?? "",
    publicEmail: profile.publicEmail ?? "",
    linkedIn: profile.linkedIn ?? "",
    instagram: profile.instagram ?? "",
  };
}
