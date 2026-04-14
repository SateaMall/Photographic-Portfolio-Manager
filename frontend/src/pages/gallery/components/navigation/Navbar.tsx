import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Collapsible from "@radix-ui/react-collapsible";
import "./Navbar.css";
import { fetchPublicProfile } from "../../../../api/profile";
import { useAuth } from "../../../../auth/AuthContext";
import { PROFILE_MANAGED_EVENT, type ProfileManagedDetail } from "../profileEvents";
import type { PublicProfileResponse } from "../../../../types/types";

export function Navbar() {
  const { slug } = useParams() 
  const navigate = useNavigate();
  const { isAuthenticated, session, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);

  useEffect(() => {
      let active = true;
  
      if (!slug) {
        return () => {
          active = false;
        };
      }
  
      fetchPublicProfile(slug)
        .then((result) => {
          if (active) {
            setProfile(result);
          }
        })
        .catch(() => {
          if (active) {
            setProfile(null);
          }
        });
  
      return () => {
        active = false;
      };
    }, [slug]);

      useEffect(() => {
      function onProfileManaged(event: Event) {
        const detail = (event as CustomEvent<ProfileManagedDetail>).detail;
        if (detail.profile.slug === slug?.trim().toLowerCase()) {
          setProfile(detail.profile);
        }
      }

      window.addEventListener(PROFILE_MANAGED_EVENT, onProfileManaged as EventListener);

      return () => {
        window.removeEventListener(PROFILE_MANAGED_EVENT, onProfileManaged as EventListener);
      };
    }, [slug]);

      useEffect(() => {
      if (!profile) return;
      document.title = profile?.displayName?.trim() || "Let Me Lens";
    }, [profile]);
    
    if (!profile) return null;
     
  // Base for albums/photos links and brand
  const base = `/${slug}`;
  const configurationTarget = session.profileSlug ? `/${session.profileSlug.trim().toLowerCase()}/manage` : "/profiles";

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    navigate("/", { replace: true });
  }



  return (
    <header className="rg-nav">
      <div className="rg-nav__inner">
        {/* Brand */}
        <Link className="rg-brand" to={base} >
          {profile?.displayName || slug}
        </Link>

        {/* Mobile toggle */}
        <button
          className={`rg-burger${open ? " rg-burger--open" : ""}`}
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="rg-burger__line" />
          <span className="rg-burger__line" />
          <span className="rg-burger__line" />
        </button>

        {/* Desktop nav */}
        <NavigationMenu.Root className="rg-menu rg-menu--desktop">
          <NavigationMenu.List className="rg-list">
            <NavigationMenu.Item>
              <NavLink className="rg-link" to={`${base}#albums`}>
                Albums
              </NavLink>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <NavLink className="rg-link" to={`${base}#photos`}>
                Photos
              </NavLink>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <NavLink className="rg-link" to={`${base}#contact`}>
                Contact
              </NavLink>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>

        {isAuthenticated && (
          <div className="rg-owner">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className="rg-owner-trigger" type="button">
                Profile
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content className="rg-dropdown" sideOffset={12} align="end">
                  <DropdownMenu.Item asChild>
                    <Link className="rg-dd-item" to={configurationTarget}>
                      My Studio
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className="rg-dd-sep" />

                  <DropdownMenu.Item asChild>
                    <button type="button" className="rg-dd-item rg-dd-item--button" onClick={() => { void handleSignOut(); }}>
                      Sign out
                    </button>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        )}
      </div>

      {/* Mobile menu (Collapsible) */}
      <Collapsible.Root open={open} onOpenChange={setOpen} className="rg-mobile">
        <Collapsible.Content className="rg-mobile__content">
          <nav className="rg-mobile__links">
            <NavLink className="rg-link rg-link--mobile" to={`${base}#albums`} onClick={() => setOpen(false)}>
              Collections
            </NavLink>
            <NavLink className="rg-link rg-link--mobile" to={`${base}#photos`} onClick={() => setOpen(false)}>
              Photos
            </NavLink>
            <NavLink className="rg-link rg-link--mobile" to={`${base}#contact`} onClick={() => setOpen(false)}>
              Contact
            </NavLink>
            <div className="rg-divider" />

            {isAuthenticated && (
              <>
                <Link className="rg-link rg-link--mobile" to={configurationTarget} onClick={() => setOpen(false)}>
                  Configuration
                </Link>
                <button type="button" className="rg-link rg-link--mobile rg-link--button" onClick={() => { void handleSignOut(); }}>
                  Sign out
                </button>
              </>
            )}
          </nav>
        </Collapsible.Content>
      </Collapsible.Root>
    </header>
  );
}

