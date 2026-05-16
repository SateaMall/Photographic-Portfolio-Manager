import { Link } from "react-router-dom";

import "./GalleryFooter.css";

export function GalleryFooter() {
  return (
    <footer className="gallery-footer">
      <p>
        Created with <Link className="gallery-footer__link" to="/">© 2026 Let Me Lens</Link>.
      </p>
      <p>Empowering photographers to share what matters to them.</p>
    </footer>
  );
}
