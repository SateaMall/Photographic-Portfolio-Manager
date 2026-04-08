import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export function ScrollToHash() {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType(); 
  useEffect(() => {
    if (!hash || navType === "POP") return;
   const go = () => { const el = document.querySelector(hash);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
   };
  requestAnimationFrame(go);
  setTimeout(go, 150);

  }, [hash, navType, pathname]);


  return null;
}
