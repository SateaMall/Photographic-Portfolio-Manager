// src/router.tsx
import { createBrowserRouter } from "react-router-dom";

import WelcomePage from "./pages/gallery/welcome/WelcomePage.tsx";
import GalleryLayout from "./layouts/GalleryLayout";
import RootLayout from "./layouts/RootLayout.tsx";
import NotFound from "./pages/home/notFound.tsx";
import { GalleryShell } from "./layouts/components/popup/GalleryShell.tsx";
import HomePage from "./pages/home/HomePage.tsx";
import LoginPage from "./pages/home/auth/LoginPage.tsx";
import SignupPage from "./pages/home/auth/SignupPage.tsx";
import VerifyEmailPage from "./pages/home/auth/VerifyEmailPage.tsx";


export const router = createBrowserRouter([
  { path: "/",  element: <RootLayout />, children: [
  { index : true, element: <HomePage /> },
  { path: "login", element: <LoginPage /> },
  { path: "signup", element: <SignupPage /> },
  { path: "verify-email", element: <VerifyEmailPage /> },
  { path: "profiles", element: <WelcomePage /> },

{
  path: ":slug/*",
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
