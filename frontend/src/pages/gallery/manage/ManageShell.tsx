import { Link, Navigate, Outlet, useLocation, useParams } from "react-router-dom";

import { Navbar } from "../components/navigation/Navbar";
import "./ManagePage.css";

function normalizeSlug(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export default function ManageShell() {
  const { slug } = useParams();
  const location = useLocation();
  const profileSlug = normalizeSlug(slug);

  if (!profileSlug) {
    return <Navigate to="/profiles" replace />;
  }

  const basePath = `/${profileSlug}/manage`;

  function navItemClass(to: string, options?: { hash?: string; nested?: boolean }) {
    const nested = options?.nested ?? false;
    const pathnameMatches = nested
      ? location.pathname === to || location.pathname.startsWith(`${to}/`)
      : location.pathname === to;

    const hashMatches = options?.hash == null
      ? true
      : location.hash === options.hash || (location.hash === "" && options.hash === "#social-media");

    return `manage-nav__${nested ? "sublink" : "link"} ${pathnameMatches && hashMatches ? "is-active" : ""}`;
  }

  return (
    <div className="manage-page">
      <div className="manage-page__topbar">
        <Navbar />
      </div>

      <div className="manage-page__content">
        <div className="manage-shell">
          <aside className="manage-shell__sidebar">
            <div className="">
              <p className="manage-shell__eyebrow">Configuration</p>
            </div>

            <nav className="manage-nav" aria-label="Gallery configuration navigation">
              <section className="manage-nav__section">
                <h2 className="manage-nav__heading">Photos</h2>
                <Link className={navItemClass(`${basePath}/photos`, { hash: "#queue", nested: true })} to={`${basePath}/photos#queue`}>
                  New photo
                </Link>
                <Link className={navItemClass(`${basePath}/photos`)} to={`${basePath}/photos`}>
                  Configure photos
                </Link>
              </section>

              <section className="manage-nav__section">
                <h2 className="manage-nav__heading">Collection</h2>
                <Link className={navItemClass(`${basePath}/albums`, { hash: "#new-album" })} to={`${basePath}/albums#new-album`}>
                  New collection
                </Link>
                <Link className={navItemClass(`${basePath}/albums`, { nested: true })} to={`${basePath}/albums`}>
                  Configure collection
                </Link>
              </section>

              <section className="manage-nav__section">
                <h2 className="manage-nav__heading">Profile</h2>
                 <Link className={navItemClass(`${basePath}/profile`, { hash: "#display-name", nested: true })} to={`${basePath}/profile#display-name`}>
                  About me
                </Link>
                <Link className={navItemClass(`${basePath}/profile`, { hash: "#social-media" })} to={`${basePath}/profile#social-media`}>
                  Social media
                </Link>
                <Link className={navItemClass(`${basePath}/profile/carousel`, { nested: true })} to={`${basePath}/profile/carousel`}>
                  Carousel/ Slides
                </Link>
                <Link className={navItemClass(`${basePath}/profile`, { hash: "#colors", nested: true })} to={`${basePath}/profile#colors`}>
                  Colors
                </Link>
               
              </section>
            </nav>
          </aside>

          <main className="manage-shell__content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
