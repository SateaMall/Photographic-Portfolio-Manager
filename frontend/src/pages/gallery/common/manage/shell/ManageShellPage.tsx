import { useState } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";

import { getManageBasePath } from "../shared/utils/manageRoute";
import { normalizeSlug } from "../shared/utils/manageSlug";
import { ManageSidebarNavigation } from "./ManageSidebarNavigation";
import { ManageTopbar } from "./ManageTopbar";
import "../ManagePage.css";

export default function ManageShellPage() {
  const { slug } = useParams();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const profileSlug = normalizeSlug(slug);

  if (!profileSlug) {
    return <Navigate to="/profiles" replace />;
  }

  const basePath = getManageBasePath(profileSlug);
  const shellClassName = isSidebarOpen ? "manage-shell" : "manage-shell manage-shell--sidebar-collapsed";
  const sidebarToggleLabel = isSidebarOpen ? "Collapse configuration menu" : "Expand configuration menu";

  return (
    <div className="manage-page">
      <div className="manage-page__topbar">
        <ManageTopbar />
      </div>

      <div className="manage-page__content">
        <div className={shellClassName}>
          <aside className="manage-shell__sidebar">
            <div className="manage-shell__sidebar-card">
              <button
                type="button"
                className="manage-shell__sidebar-toggle"
                onClick={() => setIsSidebarOpen((open) => !open)}
                aria-expanded={isSidebarOpen}
                aria-label={sidebarToggleLabel}
                title={sidebarToggleLabel}
              >
                {isSidebarOpen ? <BsChevronLeft aria-hidden="true" /> : <BsChevronRight aria-hidden="true" />}
              </button>

              {isSidebarOpen && (
                <>
                  <div className="manage-shell__sidebar-header">
                    <p className="manage-shell__eyebrow">Configuration</p>
                  </div>

                  <ManageSidebarNavigation basePath={basePath} pathname={location.pathname} hash={location.hash} />
                </>
              )}
            </div>
          </aside>

          <main className="manage-shell__content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
