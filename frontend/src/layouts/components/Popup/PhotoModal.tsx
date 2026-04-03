import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { fetchPublicProfile } from "../../../api/profiles";
import PhotoPage from "../../../pages/PhotoBrowser/PhotoPage"
import "./PhotoModal.css"

type ThemeStyle = CSSProperties & {
  "--primaryColor": string;
  "--secondaryColor": string;
};

export function PhotoModal() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const [resolvedProfile, setResolvedProfile] = useState<{
    slug: string;
    primaryColor: string | null;
    secondaryColor: string | null;
    failed: boolean;
  } | null>(null);

  useEffect(() => {
    let active = true;
    const profileSlug = slug?.trim().toLowerCase() ?? "";

    if (!profileSlug) {
      return () => {
        active = false;
      };
    }

    fetchPublicProfile(profileSlug)
      .then((profile) => {
        if (active) {
          setResolvedProfile({
            slug: profileSlug,
            primaryColor: profile.primaryColor,
            secondaryColor: profile.secondaryColor,
            failed: false,
          });
        }
      })
      .catch(() => {
        if (active) {
          setResolvedProfile({
            slug: profileSlug,
            primaryColor: null,
            secondaryColor: null,
            failed: true,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const profileSlug = slug?.trim().toLowerCase() ?? "";

  if (!profileSlug || resolvedProfile?.slug === profileSlug && resolvedProfile.failed) {
    return <Navigate to="/profiles" replace />;
  }

  if (!resolvedProfile || resolvedProfile.slug !== profileSlug) {
    return <div>Loading photo…</div>;
  }

  const themeStyle: ThemeStyle = {
    "--primaryColor": resolvedProfile.primaryColor ?? "#111827",
    "--secondaryColor": resolvedProfile.secondaryColor ?? "#886c4e",
  };

  return (
    <div style={themeStyle}>
    <Dialog.Root open onOpenChange={(open) => !open && navigate(-1)}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay-popup" />
        <Dialog.Content className="modal-content-popup" aria-label="Photo viewer">
            <Dialog.Title></Dialog.Title>
            <Dialog.Description></Dialog.Description>
            <Dialog.Close className="modal-close-popup" aria-label="Close">
                ✕
            </Dialog.Close>
            <div ref={(node) => setPortalEl(node)} />
                        {/* wait until portalEl exists */}
            {portalEl && (
                <PhotoPage
                lightboxPortalContainer={portalEl}
                // forces PhotoProvider to re-mount with a real container
                lightboxKey="lightbox-ready"/>
            )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
    </div>
  );
}
