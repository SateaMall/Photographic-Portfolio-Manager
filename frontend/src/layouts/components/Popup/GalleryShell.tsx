import { Navigate, Routes, Route, useLocation, useParams } from "react-router-dom";
import { RequireAuthenticated } from "../../../auth/RequireAuthenticated";
import Homepage from "../../../pages/gallery/theme-one/profile/ProfilePage";
import AlbumPage from "../../../pages/gallery/theme-one/album/AlbumPage";
import PhotoPage from "../../../pages/gallery/common/photo/PhotoPage";
import ManageAlbumPage from "../../../pages/gallery/common/manage/ManageAlbumPage";
import ManageShell from "../../../pages/gallery/common/manage/ManageShell";
import ProfileCarouselPage from "../../../pages/gallery/common/manage/ProfileCarouselPage";
import ProfilePhotosManagePage from "../../../pages/gallery/common/manage/ProfilePhotosManagePage";
import ProfileSettingsPage from "../../../pages/gallery/common/manage/ProfileSettingsPage";
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
          <Route path="manage" element={<RequireAuthenticated><ManageShell /></RequireAuthenticated>}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ProfileSettingsPage />} />
            <Route path="profile/carousel" element={<ProfileCarouselPage />} />
            <Route path="photos" element={<ProfilePhotosManagePage />} />
            <Route path="albums" element={<ManageAlbumPage />} />
            <Route path="albums/:albumId" element={<ManageAlbumPage />} />
          </Route>

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
