import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";

import PhotoPage from "../../../pages/PhotoBrowser/PhotoPage"
import "./PhotoModal.css"
import { useRef, useState } from "react";


export function PhotoModal() {
  const navigate = useNavigate();
  const lightboxPortalRef = useRef<HTMLDivElement>(null);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  return (
    <Dialog.Root open onOpenChange={(open) => !open && navigate(-1)}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay-popup" />
        <Dialog.Content className="modal-content-popup" aria-label="Photo viewer"
  >
            <Dialog.Title></Dialog.Title>
            <Dialog.Description>
            </Dialog.Description>

          <Dialog.Close className="modal-close-popup" aria-label="Close">
            ✕
          </Dialog.Close>
          <div ref={(node) => setPortalEl(node)} />
                      {/* wait until portalEl exists */}
          {portalEl && (
            <PhotoPage
              lightboxPortalContainer={portalEl}
              // forces PhotoProvider to re-mount with a real container
              lightboxKey="lightbox-ready"
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}