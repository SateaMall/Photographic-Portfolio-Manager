import type { PhotoResponse } from "../types/types";
import { photoFileUrl } from "../api/photos";
import "./PhotoCard.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { PROFILE_BY_ID } from "../constants/constants";
import { BsPersonFill, BsLink45Deg, BsGeoAltFill } from "react-icons/bs";
import { useOpenPhoto } from "./Popup/useOpenPhoto";

export function PhotoCard({ photo }: { photo: PhotoResponse }) {
  const navigate = useNavigate();
  const { context } = useParams();
  const image = photoFileUrl(photo.id);
  const [copied, setCopied] = useState(false);
  const openPhoto = useOpenPhoto();

  function onOwnerClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();     // prevents the article onClick
    navigate(`/${photo.owner}`);
  }


  async function onShare(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();

    const urlToCopy = `${window.location.origin}/${context}/photo/${photo.id}`;

    try {
      await navigator.clipboard.writeText(urlToCopy);
    } catch {
      window.prompt("Copy this link:", urlToCopy);
    }
    setCopied(true); 
  }
  
  const p = PROFILE_BY_ID[photo.owner];

  return (
    <article
      className="photo-card"
      role="button"
      tabIndex={0}
      onClick={() => openPhoto(photo.id,"modal")}
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
          <span className="photo-location-name">{photo.city}, {photo.country}</span>
        </button>

        <button
          type="button"
          className="photo-owner"
          onClick={onOwnerClick}
        >
          <span className="photo-owner-avatar"  style={{ ["--bgCard" as any]: p.avatar?.bg  ?? "#111827" ,
                  ["--bgCardHover" as any]: p.avatar?.bgHoverOn
                }}>
          <BsPersonFill/>
          </span>
            <span className="photo-owner-name"> {p.label}</span>
          
        </button>
      </div>
    </article>
  );
}
