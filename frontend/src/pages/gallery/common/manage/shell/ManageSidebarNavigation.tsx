import { Link } from "react-router-dom";

import { MANAGE_NAVIGATION_SECTIONS, type ManageNavItem } from "./manageNavigationConfig";

type ManageSidebarNavigationProps = {
  basePath: string;
  pathname: string;
  hash: string;
  className?: string;
  onNavigate?: () => void;
};

function getLinkClassName(pathname: string, hash: string, to: string, item: ManageNavItem) {
  const pathnameMatches = item.nested
    ? pathname === to || pathname.startsWith(`${to}/`)
    : pathname === to;

  const hashMatches = item.hash == null
    ? hash === ""
    : hash === item.hash || (hash === "" && item.hash === "#social-media");

  return `manage-nav__${item.nested ? "sublink" : "link"} ${pathnameMatches && hashMatches ? "is-active" : ""}`;
}

export function ManageSidebarNavigation({ basePath, pathname, hash, className, onNavigate }: ManageSidebarNavigationProps) {
  return (
    <nav className={className ? `manage-nav ${className}` : "manage-nav"} aria-label="Gallery configuration navigation">
      {MANAGE_NAVIGATION_SECTIONS.map((section) => (
        <section className="manage-nav__section" key={section.heading}>
          <h2 className="manage-nav__heading">{section.heading}</h2>
          {section.items.map((item) => {
            const to = `${basePath}${item.path}`;
            const href = item.hash ? `${to}${item.hash}` : to;

            return (
              <Link className={getLinkClassName(pathname, hash, to, item)} to={href} key={href} onClick={onNavigate}>
                {item.label}
              </Link>
            );
          })}
        </section>
      ))}
    </nav>
  );
}
