import { Link } from "react-router-dom";

import "./PhotoNavbar.css";

type PhotoNavbarProps = {
  photographerName: string;
  profilePath: string;
};

export function PhotoNavbar({ photographerName, profilePath }: PhotoNavbarProps) {
  return (
    <header className="photo-navbar" aria-label="Photo page navigation">
      <div className="photo-navbar__inner">
        <Link className="photo-navbar__brand" to={profilePath}>
          {photographerName}
        </Link>
      </div>
    </header>
  );
}
