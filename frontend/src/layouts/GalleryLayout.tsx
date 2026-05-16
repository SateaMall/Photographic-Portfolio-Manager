import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";

import { fetchPublicProfile } from "../api/profile";
import type { PublicProfileResponse } from "../types/types";
import { GalleryProfileContext } from "./GalleryProfileContext";
import { ScrollToTop } from "./components/ScrollToTop";
import { ScrollToHash } from "./components/ScrollToHash";
import "./GalleryLayout.css";

type ThemeStyle = CSSProperties & {
  "--primaryColor": string;
  "--secondaryColor": string;
};

function normalizeGallerySlug(slug?: string) {
  return slug?.trim().toLowerCase() ?? "";
}

function formatGalleryName(slug: string) {
  const words = slug.split("-").filter(Boolean);

  if (words.length === 0) {
    return "Photo Gallery";
  }

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
    return <Navigate to="/" replace />;
  }

  if (!resolvedProfile || resolvedProfile.slug !== profileSlug || !profile || !contextValue) {
    return (
      <section className="gallery-loading" role="status" aria-live="polite" aria-busy="true">
        <div className="gallery-loading__panel">
          <p className="gallery-loading__eyebrow">Opening gallery</p>
          <h1 className="gallery-loading__title">{formatGalleryName(profileSlug)}</h1>
          <p className="gallery-loading__copy">Preparing the portfolio and first images.</p>

          <div className="gallery-loading__progress" aria-hidden="true">
            <span className="gallery-loading__progress-bar" />
          </div>
        </div>

        <div className="gallery-loading__filmstrip" aria-hidden="true">
          <span className="gallery-loading__frame gallery-loading__frame--tall" />
          <span className="gallery-loading__frame gallery-loading__frame--wide" />
          <span className="gallery-loading__frame gallery-loading__frame--square" />
        </div>
      </section>
    );
  }

  const themeStyle: ThemeStyle = {
    "--primaryColor": profile.primaryColor ?? "#ffffff",
    "--secondaryColor": profile.primaryColor ?? "#fcfcfc",
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
