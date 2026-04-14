import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";

import { fetchPublicProfile } from "../api/profile";
import { PROFILE_MANAGED_EVENT, type ProfileManagedDetail } from "../pages/gallery/components/profileEvents";
import type { PublicProfileResponse } from "../types/types";
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

  useEffect(() => {
    function onProfileManaged(event: Event) {
      const detail = (event as CustomEvent<ProfileManagedDetail>).detail;

      if (detail.profile.slug !== profileSlug) {
        return;
      }

      setResolvedProfile({ slug: profileSlug, profile: detail.profile, failed: false });
    }

    window.addEventListener(PROFILE_MANAGED_EVENT, onProfileManaged as EventListener);

    return () => {
      window.removeEventListener(PROFILE_MANAGED_EVENT, onProfileManaged as EventListener);
    };
  }, [profileSlug]);


  if (!profileSlug || resolvedProfile?.slug === profileSlug && resolvedProfile.failed) {
    return <Navigate to="/profiles" replace />;
  }

  if (!resolvedProfile || resolvedProfile.slug !== profileSlug || !resolvedProfile.profile) {
    return <div>Loading gallery…</div>;
  }

  const profile = resolvedProfile.profile;

  const themeStyle: ThemeStyle = {
    "--primaryColor": profile.primaryColor ?? "#3b6e37",
    "--secondaryColor": profile.secondaryColor ?? "#e9ff3f",
  };

  return (
    <div style={themeStyle}>
      <ScrollToTop />
      <ScrollToHash />
      <Outlet />
    </div>
  );
}
