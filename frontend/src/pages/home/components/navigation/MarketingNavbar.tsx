import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../../../auth/AuthContext";
import "./MarketingNavbar.css";

type MarketingNavbarProps = {
  overlay?: boolean;
};

export function MarketingNavbar({ overlay = false }: MarketingNavbarProps) {
  const { isAuthenticated, session } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const scrolled = !overlay || hasScrolled;

  useEffect(() => {
    if (!overlay) {
      return;
    }

    const syncScroll = () => {
      setHasScrolled(window.scrollY > 32);
    };

    syncScroll();
    window.addEventListener("scroll", syncScroll, { passive: true });
    return () => window.removeEventListener("scroll", syncScroll);
  }, [overlay]);

  const actionTo = isAuthenticated ? (session.profileSlug ? `/${session.profileSlug}` : "/profiles") : "/login";
  const actionLabel = isAuthenticated ? "Open gallery" : "Sign in";

  return (
    <header className={`marketing-nav${overlay ? " marketing-nav--overlay" : ""}${scrolled ? " marketing-nav--scrolled" : ""}`}>
      <div className="marketing-nav__inner">
        <Link className="marketing-nav__brand" to="/">
          Let me Lens
        </Link>

        <button
          className={`marketing-nav__toggle${menuOpen ? " marketing-nav__toggle--open" : ""}`}
          type="button"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`marketing-nav__links${menuOpen ? " marketing-nav__links--open" : ""}`} aria-label="Primary">
          <Link className="marketing-nav__link" to="/satea" onClick={() => setMenuOpen(false)}>
            Exemple
          </Link>
          <Link className="marketing-nav__link" to="/#about" onClick={() => setMenuOpen(false)}>
            Why Us
          </Link>
          {/* <Link className="marketing-nav__link" to="/#contact" onClick={() => setMenuOpen(false)}>
            Contact Us
          </Link> */}
          <Link className="marketing-nav__action" to={actionTo} onClick={() => setMenuOpen(false)}>
            {actionLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}
