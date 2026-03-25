import { useNavigate, useParams } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";

import PhotoPage from "../../../pages/PhotoBrowser/PhotoPage"
import "./PhotoModal.css"
import { useState } from "react";
import { PROFILE_BY_ID } from "../../../constants/constants";


export function PhotoModal() {
  const navigate = useNavigate();
  const { context } = useParams();
  const profile = context ? PROFILE_BY_ID[context.toUpperCase() as keyof typeof PROFILE_BY_ID] : null;
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  return (
    <div style={{ ["--primaryColor" as any]: profile?.avatar?.primaryColor  ?? "#111827" ,
      ["--secondaryColor" as any]: profile?.avatar?.secondaryColor}}>
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