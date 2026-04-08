import { Routes, Route, useLocation, useParams } from "react-router-dom";
import Homepage from "../../../pages/profilePage/ProfilePage";
import AlbumPage from "../../../pages/PhotoBrowser/AlbumPage";
import PhotoPage from "../../../pages/PhotoBrowser/PhotoPage";
import {PhotoModal} from "./PhotoModal";


export function GalleryShell() {
  
  const { slug } = useParams();          // ✅ needed for absolute paths
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;
  console.log("GalleryShell location:", location.pathname, { backgroundLocation });

  if (!slug) return null;

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
            <Route path="album/:albumId/photo/:photoId" element={<PhotoModal />} />
          </Routes>
        )}
      </>
    );
  }
