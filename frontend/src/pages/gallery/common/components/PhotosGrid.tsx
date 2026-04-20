import { useEffect, useRef, useState } from "react";
import type { PhotoResponse } from "../../../../types/types";
import { fetchPhotos } from "../../../../api/profile";
import { useParams } from "react-router-dom";
import { PhotoCard } from "./PhotoCard";

import "./PhotosGrid.css"
import {fetchAlbumItemsAsPhotos } from "../../../../api/photo-album";
import { useOpenPhoto } from "../../../../layouts/components/popup/useOpenPhoto";
import { PHOTO_MANAGED_EVENT, type PhotoManagedDetail } from "../photo/components/photoEvents";

type PhotosGridProps = {
  photoId?: string;
  albumId?: string;
  onPhotosChange?: (photos: PhotoResponse[]) => void;
};

export function PhotosGrid({ photoId, albumId, onPhotosChange }: PhotosGridProps) {
  const { slug } = useParams(); 
  const pageSize = photoId ? 8 : 20;
  const firstVisible = 12;
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [page, setPage] = useState(0); // backend page index
  const [error, setError] = useState<string | null>(null); 
  const [visibleCount, setVisibleCount] = useState(firstVisible);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [initialRevealDone, setInitialRevealDone] = useState(false);
  const hasHiddenInCurrent = !initialRevealDone && visibleCount < photos.length;
  const restoreScrollYRef = useRef<number | null>(null);
  const [photosLoading, setPhotosLoading] = useState(false);
  const openPhoto = useOpenPhoto();


// Context can change (via routing), we need to reset when that happens
useEffect(() => {
  const frameId = window.requestAnimationFrame(() => {
    setPhotos([]);
    setPage(0);
    setVisibleCount(firstVisible);
    setHasMorePages(true);
    setInitialRevealDone(false);
    setError(null);
  });

  return () => {
    window.cancelAnimationFrame(frameId);
  };
}, [albumId, firstVisible, photoId, slug]);

useEffect(() => {
  
  let cancelled = false;
  if (!slug) return;
  const loadingFrameId = window.requestAnimationFrame(() => {
    setPhotosLoading(true);
  });
  (albumId ? fetchAlbumItemsAsPhotos(albumId) : fetchPhotos(slug, page, pageSize, photoId))
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
    window.cancelAnimationFrame(loadingFrameId);
  };
}, [albumId, page, pageSize, photoId, slug]);


useEffect(() => {
  onPhotosChange?.(photos);
}, [onPhotosChange, photos]);

useEffect(() => {
  function onPhotoManaged(event: Event) {
    const detail = (event as CustomEvent<PhotoManagedDetail>).detail;

    if (detail.type === "updated") {
      setPhotos((currentPhotos) => currentPhotos.map((photo) => (
        photo.id === detail.photo.id
          ? { ...photo, ...detail.photo }
          : photo
      )));
      return;
    }

    setPhotos((currentPhotos) => currentPhotos.filter((photo) => photo.id !== detail.photoId));
  }

  window.addEventListener(PHOTO_MANAGED_EVENT, onPhotoManaged as EventListener);

  return () => {
    window.removeEventListener(PHOTO_MANAGED_EVENT, onPhotoManaged as EventListener);
  };
}, []);

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
        <PhotoCard key={p.id} photo={p} onClick={() => openPhoto(p.id, "modal", albumId)}/>
      ))}
    </div>

    {/* FIRST SEE MORE (fade reveal) */}
    {hasHiddenInCurrent && (
      <>
        <div className="photos-fade" />
        <div className="photos-more">
          <button className="hp-more-btn" type="button" onClick={revealHidden}>
            See more
          </button>
        </div>
      </>
    )}
  </div>

  {/* SECOND SEE MORE (pagination) */}
  {!hasHiddenInCurrent && hasMorePages && !photoId && !albumId &&(
    <div style={{ textAlign: "center", marginTop: 20 }} >
      <button className="hp-more-btn" type="button" onClick={loadMore}>
        Load more photos
      </button>
    </div>
  )}
  </>
);
}
