import { Routes, Route, useLocation, useNavigate, useParams } from "react-router-dom";
import Homepage from "../../../pages/homepage/Homepage";
import AlbumPage from "../../../pages/PhotoBrowser/AlbumPage";
import PhotoPage from "../../../pages/PhotoBrowser/PhotoPage";
import * as Dialog from "@radix-ui/react-dialog";
import "./PhotoModal.css"


function PhotoModal() {
  const navigate = useNavigate();

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
          <PhotoPage />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function GalleryShell() {
  
  const { context } = useParams();          // ✅ needed for absolute paths
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;
console.log("GalleryShell location:", location.pathname, { backgroundLocation });

  if (!context) return null;

  return (
      <>
        {/* BackgroundLocation (whats behind the popup)*/}
        <Routes location={backgroundLocation || location}>
          <Route path="/" element={<Homepage />} />
          <Route path="album/:albumId" element={<AlbumPage />} />

          {/* full page photo when opened directly */}
          <Route path="photo/:photoId" element={<PhotoPage />} />
        </Routes>

        {/* modal(whats in the popup), when photo is opened from inside app */}
        {backgroundLocation && (
          <Routes>
            <Route path="photo/:photoId" element={<PhotoModal />} />
          </Routes>
        )}
      </>
    );
  }