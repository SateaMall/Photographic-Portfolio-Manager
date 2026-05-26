// src/router.tsx
import { createBrowserRouter } from "react-router-dom";
import GalleryLayout from "./layouts/GalleryLayout";
import RootLayout from "./layouts/RootLayout.tsx";
import NotFound from "./pages/home/notFound.tsx";
import { GalleryShell } from "./layouts/components/popup/GalleryShell.tsx";
import HomePage from "./pages/home/HomePage.tsx";
import ForgotPasswordPage from "./pages/home/auth/ForgotPasswordPage.tsx";
import LoginPage from "./pages/home/auth/LoginPage.tsx";
import PrivacyNoticePage from "./pages/home/legal/PrivacyNoticePage";
import ResetPasswordPage from "./pages/home/auth/ResetPasswordPage.tsx";
import SignupPage from "./pages/home/auth/SignupPage.tsx";
import VerifyEmailPage from "./pages/home/auth/VerifyEmailPage.tsx";


export const router = createBrowserRouter([
  { path: "/",  element: <RootLayout />, children: [
  { index : true, element: <HomePage /> },
  { path: "forgot-password", element: <ForgotPasswordPage /> },
  { path: "login", element: <LoginPage /> },
  { path: "privacy", element: <PrivacyNoticePage /> },
  { path: "reset-password", element: <ResetPasswordPage /> },
  { path: "signup", element: <SignupPage /> },
  { path: "verify-email", element: <VerifyEmailPage /> },

{
  path: ":slug/*",
  element: (
  <GalleryLayout />),
  children: [
     { path: "*", element: <GalleryShell /> }
  ],
},
  { path: "*", element: <NotFound /> } 
] },
]);
