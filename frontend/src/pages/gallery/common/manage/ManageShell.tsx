import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";

import { ManageNavigation } from "./components/navigation/ManageNavigation";
import { Navbar } from "./components/navigation/Navbar";
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

  return (
    <div className="manage-page">
      <div className="manage-page__topbar">
        <Navbar />
      </div>

      <div className="manage-page__content">
        <div className="manage-shell">
          <aside className="manage-shell__sidebar">
            <div className="manage-shell__sidebar-header">
              <p className="manage-shell__eyebrow">Configuration</p>
            </div>

            <ManageNavigation basePath={basePath} pathname={location.pathname} hash={location.hash} />
          </aside>

          <main className="manage-shell__content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
