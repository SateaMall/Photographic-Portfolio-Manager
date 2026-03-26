import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

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