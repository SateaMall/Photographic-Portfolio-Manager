import { Navigate, Outlet, useParams, useLocation} from "react-router-dom";
const ALLOWED = new Set(["SATEA", "ALEXIS", "SHARED"]);
import { useEffect } from "react";


export function ScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);

  return null;
}

export default function GalleryLayout() {
  const { context } = useParams();

  if (!context || !ALLOWED.has(context)) {
    return <Navigate to="/profiles" replace />;
  }

  return (
    <>
      <Outlet />
      <ScrollToHash />
    </>
  );
}
