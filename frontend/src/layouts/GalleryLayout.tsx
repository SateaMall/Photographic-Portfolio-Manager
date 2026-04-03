import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";

import { fetchPublicProfile } from "../api/profiles";
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


  if (!profileSlug || resolvedProfile?.slug === profileSlug && resolvedProfile.failed) {
    return <Navigate to="/profiles" replace />;
  }

  if (!resolvedProfile || resolvedProfile.slug !== profileSlug || !resolvedProfile.profile) {
    return <div>Loading gallery…</div>;
  }

  const profile = resolvedProfile.profile;

  const themeStyle: ThemeStyle = {
    "--primaryColor": profile.primaryColor ?? "#111827",
    "--secondaryColor": profile.secondaryColor ?? "#886c4e",
  };

  return (
    <div style={themeStyle}>
      <ScrollToTop />
      <ScrollToHash />
      <Outlet />
    </div>
  );
}
