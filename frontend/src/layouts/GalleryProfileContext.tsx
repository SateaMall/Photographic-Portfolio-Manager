import { createContext, useContext } from "react";

import type { PublicProfileResponse } from "../types/types";

export type GalleryProfileContextValue = {
  profile: PublicProfileResponse;
  profileSlug: string;
  setProfile: (profile: PublicProfileResponse) => void;
  refreshProfile: () => Promise<PublicProfileResponse>;
};

export const GalleryProfileContext = createContext<GalleryProfileContextValue | null>(null);

export function useGalleryProfile() {
  const context = useContext(GalleryProfileContext);
  if (!context) {
    throw new Error("useGalleryProfile must be used within GalleryLayout");
  }
  return context;
}
