import { Navigate, Outlet, useParams, useLocation, useNavigationType} from "react-router-dom";
const ALLOWED = new Set(["SATEA", "ALEXIS", "SHARED"]);
import { useEffect } from "react";

export function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
   const go = () => { const el = document.querySelector(hash);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
   };
  requestAnimationFrame(go);
  setTimeout(go, 150);

  }, [pathname,hash]);


  return null;
}
export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType(); // "PUSH" | "POP" | "REPLACE"

  useEffect(() => {
    // Don't scroll to top if there's a hash or you were in a popup, the ScrollToHash component will handle it
    if (hash || navType === "POP") return;
    // Normal navigation: go to top
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash,navType]);

  return null;
}
export default function GalleryLayout() {
  const { context } = useParams();

  if (!context || !ALLOWED.has(context)) {
    return <Navigate to="/profiles" replace />;
  }

  return (
    <>
      <ScrollToTop />
      <ScrollToHash />
      <Outlet />
  
    </>
  );
}
