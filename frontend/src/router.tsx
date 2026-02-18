// src/router.tsx
import { Navigate, createBrowserRouter } from "react-router-dom";

import ProfilesPage from "./pages/ProfilesPage/ProfilesPage.tsx";
import GalleryLayout from "./layouts/GalleryLayout";
import RootLayout from "./layouts/RootLayout.tsx";
import NotFound from "./pages/NotFound";
import AdminPage from "./AdminSection/admin_upload";
import { GalleryShell } from "./layouts/components/Popup/GalleryShell.tsx";


export const router = createBrowserRouter([
  { path: "/",  element: <RootLayout />, children: [
  { index : true, element: <Navigate to="/profiles" /> },
  { path: "admin", element: <AdminPage /> },
  { path: "profiles", element: <ProfilesPage /> },

{
  path: ":context/*",
  element: (
  <GalleryLayout />),
  children: [
     { path: "*", element: <GalleryShell /> }
    /*{ index: true, element: <Homepage /> },
    { path: "album/:albumId/:photoId?", element: <AlbumPage /> },
    { path: "photo/:photoId", element: <PhotoPage /> },*/
  ],
},
  { path: "*", element: <NotFound /> } 
] },
]);
