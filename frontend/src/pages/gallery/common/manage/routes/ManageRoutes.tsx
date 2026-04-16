import { Navigate, Route } from "react-router-dom";

import { RequireAuthenticated } from "../../../../../auth/RequireAuthenticated";
import ManageAlbumsPage from "../features/albums/pages/ManageAlbumsPage";
import ProfileCarouselPage from "../features/carousel/pages/ProfileCarouselPage";
import ProfilePhotosManagePage from "../features/photos/pages/ProfilePhotosManagePage";
import ProfileSettingsPage from "../features/profile/pages/ProfileSettingsPage";
import ManageShellPage from "../shell/ManageShellPage";

export const manageRoutes = (
  <Route path="manage" element={<RequireAuthenticated><ManageShellPage /></RequireAuthenticated>}>
    <Route index element={<Navigate to="profile" replace />} />
    <Route path="profile" element={<ProfileSettingsPage />} />
    <Route path="profile/carousel" element={<ProfileCarouselPage />} />
    <Route path="photos" element={<ProfilePhotosManagePage />} />
    <Route path="albums" element={<ManageAlbumsPage />} />
    <Route path="albums/:albumId" element={<ManageAlbumsPage />} />
  </Route>
);
