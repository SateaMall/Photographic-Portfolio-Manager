import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";

import { fetchPublicProfile } from "../api/profile";
import type { PublicProfileResponse } from "../types/types";
import { GalleryProfileContext } from "./GalleryProfileContext";
import { ScrollToTop } from "./components/ScrollToTop";
import { ScrollToHash } from "./components/ScrollToHash";

type ThemeStyle = CSSProperties & {
  "--primaryColor": string;
  "--secondaryColor": string;
};

function normalizeGallerySlug(slug?: string) {
  return slug?.trim().toLowerCase() ?? "";
}

export default function GalleryLayout() {
  const { slug } = useParams();
  const profileSlug = normalizeGallerySlug(slug);
  const [resolvedProfile, setResolvedProfile] = useState<{
    slug: string;
    profile: PublicProfileResponse | null;
    failed: boolean;
  } | null>(null);

  useEffect(() => {
    let active = true;

    if (!profileSlug) {
      return () => {
        active = false;
      };
    }

    fetchPublicProfile(profileSlug)
      .then((result) => {
        if (active) {
          setResolvedProfile({ slug: profileSlug, profile: result, failed: false });
        }
      })
      .catch(() => {
        if (active) {
          setResolvedProfile({ slug: profileSlug, profile: null, failed: true });
        }
      });

    return () => {
      active = false;
    };
  }, [profileSlug]);

  const setProfile = useCallback((nextProfile: PublicProfileResponse) => {
    setResolvedProfile({
      slug: normalizeGallerySlug(nextProfile.slug),
      profile: nextProfile,
      failed: false,
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!profileSlug) {
      throw new Error("Gallery profile slug is missing.");
    }

    const nextProfile = await fetchPublicProfile(profileSlug);
    setResolvedProfile({ slug: profileSlug, profile: nextProfile, failed: false });
    return nextProfile;
  }, [profileSlug]);

  const profile = resolvedProfile?.profile ?? null;

  const contextValue = useMemo(() => (
    profile
      ? {
          profile,
          profileSlug,
          setProfile,
          refreshProfile,
        }
      : null
  ), [profile, profileSlug, refreshProfile, setProfile]);

  if (!profileSlug || resolvedProfile?.slug === profileSlug && resolvedProfile.failed) {
    return <Navigate to="/profiles" replace />;
  }

  if (!resolvedProfile || resolvedProfile.slug !== profileSlug || !profile || !contextValue) {
    return <div>Loading gallery…</div>;
  }

  const themeStyle: ThemeStyle = {
    "--primaryColor": profile.primaryColor ?? "#3b6e37",
    "--secondaryColor": profile.secondaryColor ?? "#e9ff3f",
  };

  return (
    <GalleryProfileContext.Provider value={contextValue}>
      <div style={themeStyle}>
        <ScrollToTop />
        <ScrollToHash />
        <Outlet />
      </div>
    </GalleryProfileContext.Provider>
  );
}
