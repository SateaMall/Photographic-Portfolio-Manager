import { useEffect, useRef, useState } from "react";
import type { PhotoResponse } from "../types/types";
import { fetchPhotos } from "../api/homepage";
import { useParams } from "react-router-dom";
import { PhotoCard } from "./PhotoCard";

import "./PhotosGrid.css"
import {fetchAlbumItemsAsPhotos } from "../api/photoBrowse";
import { useOpenPhoto } from "../layouts/components/Popup/useOpenPhoto";
type PhotosGridProps = {
  photoId?: string;
  albumId?: string;
  onPhotosChange?: (photos: PhotoResponse[]) => void;
}
export function PhotosGrid(PhotosGridProps: PhotosGridProps) {
  const { context } = useParams(); // "satea" | "alexis" | "shared"
  const scope = context?.toUpperCase() as "SATEA" | "ALEXIS" | "SHARED";

  const PAGE_SIZE = PhotosGridProps.photoId? 8 : 20;
  const FIRST_VISIBLE = 12;
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [page, setPage] = useState(0); // backend page index
  const [error, setError] = useState(); 
  const [visibleCount, setVisibleCount] = useState(FIRST_VISIBLE);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [initialRevealDone, setInitialRevealDone] = useState(false);
  const hasHiddenInCurrent = !initialRevealDone && visibleCount < photos.length;
  const restoreScrollYRef = useRef<number | null>(null);
  const [photosLoading, setPhotosLoading] = useState(false);
  const OpenPhoto = useOpenPhoto();


// Context can change (via routing), we need to reset when that happens
useEffect(() => {
  setPhotos([]);
  setPage(0);
  setVisibleCount(FIRST_VISIBLE);
  setHasMorePages(true);
  setInitialRevealDone(false);
}, [context,PhotosGridProps.photoId, PhotosGridProps.albumId]);

useEffect(() => {
  
  let cancelled = false;

  setPhotosLoading(true);
  (PhotosGridProps.albumId?fetchAlbumItemsAsPhotos(PhotosGridProps.albumId): 
  fetchPhotos(scope, page, PAGE_SIZE, PhotosGridProps.photoId))
    .then((res) => {
      if (cancelled) return;

      setPhotos((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newPhotos = res.content.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newPhotos];
      });

      setHasMorePages(!res.last);
    })
    .catch((e) => {
      if (!cancelled) setError(e.message);
    })
    .finally(() => {
      if (!cancelled) setPhotosLoading(false);
    });

  return () => {
    cancelled = true;
  };
}, [scope, page, PhotosGridProps.photoId, PhotosGridProps.albumId]);


useEffect(() => {
  loadCarrouselPhotos(photos);
}, [photos]);

useEffect(() => {
  if (restoreScrollYRef.current == null) return;

  // wait for DOM paint + layout
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: restoreScrollYRef.current!, behavior: "auto" });
      restoreScrollYRef.current = null;
    });
  });
}, [photos.length]);

  // Loading carrousel photos
  const loadCarrouselPhotos = (photos: PhotoResponse[]) => {
    if(PhotosGridProps.onPhotosChange)
      {PhotosGridProps.onPhotosChange(photos);}

  };

function revealHidden() {
  setVisibleCount(photos.length);
    setInitialRevealDone(true); 
}

function loadMore() {
  restoreScrollYRef.current = window.scrollY;
  setPage((p) => p + 1); // triggers API
}

return (
    <>
    {error && <div className="hp hp-error">{error}</div>}
    {photosLoading && (<div className="hp">Photos Loading…</div>)}
     <div className={`photos-preview ${hasHiddenInCurrent ? "is-clamped" : ""}`}>
    <div className="photos-masonry">
      {photos.slice(0, visibleCount).map((p) => (
        <PhotoCard key={p.id} photo={p} onClick={() => OpenPhoto(p.id,"modal",PhotosGridProps?.albumId)}/>
      ))}
    </div>

    {/* FIRST SEE MORE (fade reveal) */}
    {hasHiddenInCurrent && (
      <>
        <div className="photos-fade" />
        <div className="photos-more">
          <button className="hp-more-btn" onClick={revealHidden}>
            See more
          </button>
        </div>
      </>
    )}
  </div>

  {/* SECOND SEE MORE (pagination) */}
  {!hasHiddenInCurrent && hasMorePages && !PhotosGridProps.photoId && !PhotosGridProps.albumId &&(
    <div style={{ textAlign: "center", marginTop: 20 }} >
      <button className="hp-more-btn" onClick={loadMore}>
        Load more photos
      </button>
    </div>
  )}
  </>
);
}