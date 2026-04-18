import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../../../../auth/AuthContext";
import { getGalleryPath, getManageBasePath } from "../shared/utils/manageRoute";
import { normalizeSlug } from "../shared/utils/manageSlug";
import { ManageSidebarNavigation } from "./ManageSidebarNavigation";
import "./ManageTopbar.css";

export function ManageTopbar() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const profileSlug = normalizeSlug(slug) || normalizeSlug(session.profileSlug);

  if (!profileSlug) {
    return null;
  }

  const galleryPath = getGalleryPath(profileSlug);
  const managePath = getManageBasePath(profileSlug);
  const displayName = session.displayName?.trim() || profileSlug;

  function closeMobileNav() {
    setMobileNavOpen(false);
  }

  async function handleSignOut() {
    closeMobileNav();
    await signOut();
    navigate("/", { replace: true });
  }

  return (
    <Dialog.Root open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <header className="manage-topbar">
        <div className="manage-topbar__inner">
          <Link className="manage-topbar__brand" to={managePath}>
            <span className="manage-topbar__eyebrow">Manage</span>
            <span className="manage-topbar__title">{displayName}</span>
          </Link>

          <nav className="manage-topbar__nav" aria-label="Manage top navigation">
            <Link className="manage-topbar__link" to={galleryPath}>
              View gallery
            </Link>
          </nav>

          <div className="manage-topbar__actions">
            <div className="manage-topbar__desktop-actions">
              <button type="button" className="manage-topbar__button" onClick={() => { void handleSignOut(); }}>
                Sign out
              </button>
            </div>

            <Dialog.Trigger asChild>
              <button type="button" className="manage-topbar__burger" aria-label="Open manage navigation">
                <span />
                <span />
                <span />
              </button>
            </Dialog.Trigger>
          </div>
        </div>
      </header>

      <Dialog.Portal>
        <Dialog.Overlay className="manage-topbar__mobile-overlay" />
        <Dialog.Content className="manage-topbar__mobile-content" aria-describedby={undefined}>
          <div className="manage-topbar__mobile-shell">
            <div className="manage-topbar__mobile-header">
              <div className="manage-topbar__brand manage-topbar__brand--mobile">
                <span className="manage-topbar__eyebrow">Manage</span>
                <Dialog.Title className="manage-topbar__title">{displayName}</Dialog.Title>
              </div>

              <Dialog.Close asChild>
                <button type="button" className="manage-topbar__mobile-close" aria-label="Close manage navigation">
                  ✕
                </button>
              </Dialog.Close>
            </div>

            <ManageSidebarNavigation
              basePath={managePath}
              pathname={location.pathname}
              hash={location.hash}
              className="manage-topbar__mobile-nav"
              onNavigate={closeMobileNav}
            />

            <div className="manage-topbar__mobile-actions">
              <Link className="manage-topbar__mobile-link" to={galleryPath} onClick={closeMobileNav}>
                View gallery
              </Link>
              <button type="button" className="manage-topbar__mobile-link manage-topbar__mobile-link--button" onClick={() => { void handleSignOut(); }}>
                Sign out
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
