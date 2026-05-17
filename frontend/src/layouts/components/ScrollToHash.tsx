import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export function ScrollToHash() {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType(); 

  useEffect(() => {
    if (!hash || navType === "POP") return;

    const go = () => {
      const el = document.querySelector(hash);
      if (!el) {
        return;
      }

      try {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch {
        el.scrollIntoView(true);
      }
    };

    requestAnimationFrame(go);
    const timeoutId = window.setTimeout(go, 150);

    return () => {
      window.clearTimeout(timeoutId);
    };

  }, [hash, navType, pathname]);


  return null;
}
