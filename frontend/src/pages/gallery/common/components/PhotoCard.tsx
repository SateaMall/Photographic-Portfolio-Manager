import type { PhotoResponse } from "../../../../types/types";
import { photoFileUrl } from "../../../../api/photos";
import "./PhotoCard.css";
import {  useParams } from "react-router-dom";
import { useState } from "react";
import { BsLink45Deg, BsGeoAltFill } from "react-icons/bs";

type PhotoCardProps = {
  photo: PhotoResponse;
  onClick?: () => void;
};

export function PhotoCard({ photo, onClick }: PhotoCardProps) {
  /*const navigate = useNavigate();*/
  const { slug } = useParams();
  const [copied, setCopied] = useState(false);

  if (!slug) return null;
  const image = photoFileUrl(photo.id, slug);

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

  
  return (
    <article
      className="photo-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onMouseLeave={() => setCopied(false)} // reset when hover ends
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
            {photo.city}
            {photo.city && photo.country ? ", " : ""}
            {photo.country}
          </span>
        </button>
        {/*
        <button
          type="button"
          className="photo-owner"
          onClick={onOwnerClick}
        >
          <span className="photo-owner-avatar"  style={{ ["--primaryColorCard" as any]: p.avatar?.primaryColor  ?? "#111827" ,
                  ["--secondaryColorCard" as any]: p.avatar?.secondaryColor
                }}>
          <BsPersonFill/>
          </span>
            <span className="photo-owner-name"> {p.label}</span>
          
        </button>
        */}
      </div>
    </article>
  );
}
