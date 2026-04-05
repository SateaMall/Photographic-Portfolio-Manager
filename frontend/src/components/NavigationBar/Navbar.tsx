import { Link, NavLink, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Collapsible from "@radix-ui/react-collapsible";
import "./Navbar.css";
import { fetchPublicProfile } from "../../api/profiles";
import type { PublicProfileResponse } from "../../types/types";

export function Navbar() {
  const { slug } = useParams() 
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
  
    if (!profile) return null;
    
  // Base for albums/photos links and brand
  const base = `/${slug}`;

  return (
    <header className="rg-nav">
      <div className="rg-nav__inner">
        {/* Brand */}
        <Link className="rg-brand" to={base} >
          {profile?.displayName || slug}
        </Link>

        {/* Mobile toggle */}
        <button
          className="rg-burger"
          type="button"
          aria-label="Open menu"
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

            <NavigationMenu.Item className="rg-spacer" />

            <NavigationMenu.Item>
              <SpacesDropdown />
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </div>

      {/* Mobile menu (Collapsible) */}
      <Collapsible.Root open={open} onOpenChange={setOpen} className="rg-mobile">
        <Collapsible.Content className="rg-mobile__content">
          <nav className="rg-mobile__links">
            <NavLink className="rg-link rg-link--mobile" to={`${base}#albums`} onClick={() => setOpen(false)}>
              Albums
            </NavLink>
            <NavLink className="rg-link rg-link--mobile" to={`${base}#photos`} onClick={() => setOpen(false)}>
              Photos
            </NavLink>
            <NavLink className="rg-link rg-link--mobile" to={`${base}#contact`} onClick={() => setOpen(false)}>
              Contact
            </NavLink>

            <div className="rg-divider" />

            {/* Spaces dropdown on mobile too */}
            <div className="rg-mobile__dropdown">
              <SpacesDropdown onNavigate={() => setOpen(false)} />
            </div>
          </nav>
        </Collapsible.Content>
      </Collapsible.Root>
    </header>
  );
}

function SpacesDropdown({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="rg-link rg-trigger" type="button">
        Spaces <span className="rg-caret">▾</span>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="rg-dropdown" sideOffset={10} align="end">
          <DropdownMenu.Item className="rg-dd-item" asChild>
            <Link to="/SHARED" onClick={onNavigate}>Shared</Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="rg-dd-sep" />

          <DropdownMenu.Item className="rg-dd-item" asChild>
            <Link to="/SATEA" onClick={onNavigate}>Satea</Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item className="rg-dd-item" asChild>
            <Link to="/ALEXIS" onClick={onNavigate}>Alexis</Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="rg-dd-sep" />

          <DropdownMenu.Item className="rg-dd-item" asChild>
            <Link to="/profiles" onClick={onNavigate}>Profile picker</Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}