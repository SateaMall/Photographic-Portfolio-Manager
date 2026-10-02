import { Link } from "react-router-dom";

import "./GalleryFooter.css";

export function GalleryFooter() {
  return (
    <footer className="gallery-footer">
      <p>
        Created with <Link className="gallery-footer__link" to="/">© 2026 Let Me Lens</Link> by{" "}
        <Link className="gallery-footer__link" to="/satea-almallouhi">Satea ALMALLOUHI</Link>.
      </p>
      <p>Empowering photographers to share what matters to them.</p>
    </footer>
  );
}
