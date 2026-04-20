import { Routes, Route, useLocation, useParams } from "react-router-dom";
import Homepage from "../../../pages/gallery/theme-one/profile/ProfilePage";
import AlbumPage from "../../../pages/gallery/theme-one/album/AlbumPage";
import PhotoPage from "../../../pages/gallery/common/photo/PhotoPage";
import { manageRoutes } from "../../../pages/gallery/common/manage/routes/ManageRoutes";
import {PhotoModal} from "./PhotoModal";


export function GalleryShell() {
  
  const { slug } = useParams();          // ✅ needed for absolute paths
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;
  if (!slug) return null;

  return (
      <>
        {/* BackgroundLocation (whats behind the popup)*/}
        <Routes location={backgroundLocation || location}>
          <Route path="/" element={<Homepage />} />
          <Route path="album/:albumId" element={<AlbumPage />} />
          {manageRoutes}

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
