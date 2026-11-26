import { useEffect } from "react";

export type PageMetadata = {
  title: string;
  description: string;
  canonicalPath: string;
  imageUrl?: string | null;
  imageAlt?: string;
  robots?: string;
  type?: string;
};

export const DEFAULT_SITE_TITLE = "Let Me Lens";
export const DEFAULT_SITE_DESCRIPTION = "Let Me Lens empowers photographers to share what matters to them.";
export const DEFAULT_SITE_IMAGE_PATH = "/preview/default-image";
export const DEFAULT_SITE_IMAGE_ALT = "Let Me Lens preview";
// Must match frontend/public/letmelens-og.png served by DEFAULT_SITE_IMAGE_PATH
const DEFAULT_SITE_IMAGE_DETAILS = {
  "og:image:type": "image/png",
  "og:image:width": "1200",
  "og:image:height": "627",
} as const;

function toAbsoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return new URL(pathOrUrl, window.location.origin).toString();
}

function getOrCreateMetaByName(name: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }

  return element;
}

function getOrCreateMetaByProperty(property: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }

  return element;
}

function getOrCreateCanonicalLink() {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  return element;
}

export function buildSiteMetadata(): PageMetadata {
  return {
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_SITE_DESCRIPTION,
    canonicalPath: "/",
    imageUrl: DEFAULT_SITE_IMAGE_PATH,
    imageAlt: DEFAULT_SITE_IMAGE_ALT,
    robots: "index,follow",
    type: "website",
  };
}

export function usePageMetadata(metadata: PageMetadata) {
  const title = metadata.title.trim() || DEFAULT_SITE_TITLE;
  const description = metadata.description.trim() || DEFAULT_SITE_DESCRIPTION;
  const canonicalUrl = toAbsoluteUrl(metadata.canonicalPath);
  const imageUrl = toAbsoluteUrl(metadata.imageUrl?.trim() || DEFAULT_SITE_IMAGE_PATH);
  const isDefaultImage = new URL(imageUrl).pathname === DEFAULT_SITE_IMAGE_PATH;
  const imageAlt = metadata.imageAlt?.trim() || DEFAULT_SITE_IMAGE_ALT;
  const robots = metadata.robots?.trim() || "index,follow";
  const type = metadata.type?.trim() || "website";

  useEffect(() => {
    document.title = title;

    getOrCreateMetaByName("description").setAttribute("content", description);
    getOrCreateMetaByName("robots").setAttribute("content", robots);
    getOrCreateCanonicalLink().setAttribute("href", canonicalUrl);

    getOrCreateMetaByProperty("og:locale").setAttribute("content", "en_US");
    getOrCreateMetaByProperty("og:type").setAttribute("content", type);
    getOrCreateMetaByProperty("og:site_name").setAttribute("content", DEFAULT_SITE_TITLE);
    getOrCreateMetaByProperty("og:title").setAttribute("content", title);
    getOrCreateMetaByProperty("og:description").setAttribute("content", description);
    getOrCreateMetaByProperty("og:url").setAttribute("content", canonicalUrl);
    getOrCreateMetaByProperty("og:image").setAttribute("content", imageUrl);
    getOrCreateMetaByProperty("og:image:alt").setAttribute("content", imageAlt);
    for (const [property, value] of Object.entries(DEFAULT_SITE_IMAGE_DETAILS)) {
      if (isDefaultImage) {
        getOrCreateMetaByProperty(property).setAttribute("content", value);
      } else {
        document.head.querySelector(`meta[property="${property}"]`)?.remove();
      }
    }

    getOrCreateMetaByName("twitter:card").setAttribute("content", "summary_large_image");
    getOrCreateMetaByName("twitter:title").setAttribute("content", title);
    getOrCreateMetaByName("twitter:description").setAttribute("content", description);
    getOrCreateMetaByName("twitter:image").setAttribute("content", imageUrl);
    getOrCreateMetaByName("twitter:image:alt").setAttribute("content", imageAlt);
  }, [canonicalUrl, description, imageAlt, imageUrl, isDefaultImage, robots, title, type]);
}
