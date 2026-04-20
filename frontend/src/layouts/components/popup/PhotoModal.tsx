import { useState } from "react";
import type { CSSProperties } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useNavigate } from "react-router-dom";

import { useGalleryProfile } from "../../GalleryProfileContext";
import PhotoPage from "../../../pages/gallery/common/photo/PhotoPage"
import "./PhotoModal.css"

type ThemeStyle = CSSProperties & {
  "--primaryColor": string;
  "--secondaryColor": string;
};

export function PhotoModal() {
  const navigate = useNavigate();
  const { profile } = useGalleryProfile();
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  const themeStyle: ThemeStyle = {
    "--primaryColor": profile.primaryColor ?? "#111827",
    "--secondaryColor": profile.primaryColor ?? "#111827",
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
