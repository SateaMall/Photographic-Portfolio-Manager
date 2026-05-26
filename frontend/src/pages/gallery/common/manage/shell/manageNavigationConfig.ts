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
      { label: "New photo", path: "/photos", hash: "#queue"},
      { label: "Configure photos", path: "/photos", nested: true  },
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
      { label: "Profile overview", path: "/profile" },
      { label: "About me", path: "/profile", hash: "#about-me", nested: true },
      { label: "Social media", path: "/profile", hash: "#social-media", nested: true },
      { label: "Colors", path: "/profile", hash: "#colors", nested: true },
      { label: "Carousel / Slides", path: "/profile/carousel" },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "Statistics", path: "/account/statistics"},
      { label: "Account overview", path: "/account" },
      { label: "Profile link", path: "/account", hash: "#profile-link", nested: true },
      { label: "Password", path: "/account", hash: "#password", nested: true },
      { label: "Delete account", path: "/account", hash: "#account-removal", nested: true },

    ],
  },
];
