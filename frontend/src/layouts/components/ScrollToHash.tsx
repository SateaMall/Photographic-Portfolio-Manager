import { useEffect } from "react";
import { useLocation } from "react-router-dom";

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