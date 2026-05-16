import { useState, type CSSProperties, type KeyboardEvent } from "react";
import { BsLink45Deg, BsGeoAltFill } from "react-icons/bs";
import { useParams } from "react-router-dom";

import { photoFileUrl } from "../../../../api/photos";
import { getCountryDisplayName } from "../../../../components/forms/countryData";
import type { PhotoResponse } from "../../../../types/types";

import "./PhotoCard.css";

type PhotoCardProps = {
  photo: PhotoResponse;
  imageSrc?: string;
  onClick?: () => void;
  width?: number;
  height?: number;
};

export function PhotoCard({ photo, imageSrc, onClick, width, height }: PhotoCardProps) {
  /*const navigate = useNavigate();*/
  const { slug } = useParams();
  const [copied, setCopied] = useState(false);

  if (!slug && !imageSrc) return null;

  const image = imageSrc ?? photoFileUrl(photo.id, slug!);
  const country = getCountryDisplayName(photo.country);
  const location = [photo.city, country, photo.captureYear ? String(photo.captureYear) : null].filter(Boolean).join(", ");
  const cardStyle: CSSProperties | undefined = width != null && height != null
    ? { width, height, flexShrink: 0 }
    : undefined;

  /*function onOwnerClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();     // prevents the article onClick
    navigate(`/${photo.owner}`);
  }*/

  async function onShare(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();

    const urlToCopy = `${window.location.origin}/${slug}/photo/${photo.id}`;

    try {
      await navigator.clipboard.writeText(urlToCopy);
    } catch {
      window.prompt("Copy this link:", urlToCopy);
    }
    setCopied(true); 
  }

  function onKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (!onClick) {
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  }

  
  return (
    <article
      className="photo-card"
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={photo.title?.trim() || "Open photo"}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onMouseLeave={() => setCopied(false)} // reset when hover ends
      style={cardStyle}
    >
      <div className="photo-media">
        <img
          className="photo-img"
          src={image}
          alt={photo.title??""}
          loading="lazy"
          decoding="async"
        />

        <div className="photo-overlay" aria-hidden="true" />

        <button
          type="button"
          className={`photo-share ${copied ? "is-copied" : ""}`}
          onClick={onShare}
          aria-label={copied ? "Link copied" : "Copy photo link"}
          title={copied ? "Copied!" : "Copy link"}
        >
          {copied ? (
            <span className="photo-share-copied">Copied</span>
          ) : (
             <span className="photo-share-avatar">< BsLink45Deg /></span>
          )}
        </button>

        <button
          type="button"
          className="photo-location"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="photo-location-avatar">
            <BsGeoAltFill />
          </span>

          <span className="photo-location-name">
            {location}
          </span>
        </button>
      </div>
    </article>
  );
}
