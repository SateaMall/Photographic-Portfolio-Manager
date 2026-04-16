export type ManageNavItem = {
  label: string;
  path: string;
  hash?: string;
  nested?: boolean;
};

export type ManageNavSection = {
  heading: string;
  items: ManageNavItem[];
};

export const MANAGE_NAVIGATION_SECTIONS: ManageNavSection[] = [
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
