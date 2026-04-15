import { Link } from "react-router-dom";

type ManageNavigationProps = {
  basePath: string;
  pathname: string;
  hash: string;
  className?: string;
  onNavigate?: () => void;
};

type ManageNavItem = {
  label: string;
  path: string;
  hash?: string;
  nested?: boolean;
};

type ManageNavSection = {
  heading: string;
  items: ManageNavItem[];
};

const NAVIGATION_SECTIONS: ManageNavSection[] = [
  {
    heading: "Photos",
    items: [
      { label: "New photo", path: "/photos", hash: "#queue", nested: true },
      { label: "Configure photos", path: "/photos" },
    ],
  },
  {
    heading: "Collection",
    items: [
      { label: "New collection", path: "/albums", hash: "#new-album" },
      { label: "Configure collection", path: "/albums", nested: true },
    ],
  },
  {
    heading: "Profile",
    items: [
      { label: "About me", path: "/profile", hash: "#display-name", nested: true },
      { label: "Social media", path: "/profile", hash: "#social-media" },
      { label: "Carousel/ Slides", path: "/profile/carousel", nested: true },
      { label: "Colors", path: "/profile", hash: "#colors", nested: true },
    ],
  },
];

function getLinkClassName(pathname: string, hash: string, to: string, item: ManageNavItem) {
  const pathnameMatches = item.nested
    ? pathname === to || pathname.startsWith(`${to}/`)
    : pathname === to;

  const hashMatches = item.hash == null
    ? true
    : hash === item.hash || (hash === "" && item.hash === "#social-media");

  return `manage-nav__${item.nested ? "sublink" : "link"} ${pathnameMatches && hashMatches ? "is-active" : ""}`;
}

export function ManageNavigation({ basePath, pathname, hash, className, onNavigate }: ManageNavigationProps) {
  return (
    <nav className={className ? `manage-nav ${className}` : "manage-nav"} aria-label="Gallery configuration navigation">
      {NAVIGATION_SECTIONS.map((section) => (
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
