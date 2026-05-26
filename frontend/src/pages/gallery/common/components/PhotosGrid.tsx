import { useEffect, useRef, useState } from "react";
import { RowsPhotoAlbum, type Photo as AlbumPhoto } from "react-photo-album";
import { useParams } from "react-router-dom";

import { fetchAlbumItemsAsPhotos } from "../../../../api/photo-album";
import { photoFileUrl } from "../../../../api/photos";
import { fetchPhotos } from "../../../../api/profile";
import { useOpenPhoto } from "../../../../layouts/components/popup/useOpenPhoto";
import type { PhotoResponse } from "../../../../types/types";
import { PhotoCard } from "./PhotoCard";
import { PHOTO_MANAGED_EVENT, type PhotoManagedDetail } from "../photo/components/photoEvents";

import "react-photo-album/rows.css";
import "./PhotosGrid.css";

type GridAlbumPhoto = AlbumPhoto & {
  key: string;
  item: PhotoResponse;
  alt: string;
};

type RowsLayoutConfig = {
  spacing: number;
  targetRowHeight: number;
  rowConstraints: {
    maxPhotos: number;
    singleRowMaxHeight: number;
  };
};

function resolvePhotoDimensions(photo: PhotoResponse) {
  if (
    typeof photo.width === "number" &&
    photo.width > 0 &&
    typeof photo.height === "number" &&
    photo.height > 0
  ) {
    return { width: photo.width, height: photo.height };
  }

  return { width: 4, height: 5 };
}

function getRowsLayoutConfig(containerWidth?: number): RowsLayoutConfig {
  if (!containerWidth || containerWidth >= 900) {
    return {
      spacing: 10,
      targetRowHeight: 280,
      rowConstraints: {
        maxPhotos: 4,
        singleRowMaxHeight: 360,
      },
    };
  }

  if (containerWidth < 540) {
    return {
      spacing: 8,
      targetRowHeight: 190,
      rowConstraints: {
        maxPhotos: 2,
        singleRowMaxHeight: 250,
      },
    };
  }

  return {
    spacing: 18,
    targetRowHeight: 230,
    rowConstraints: {
      maxPhotos: 3,
      singleRowMaxHeight: 300,
    },
  };
}

function getTargetRowHeight(containerWidth?: number) {
  return getRowsLayoutConfig(containerWidth).targetRowHeight;
}

function getRowSpacing(containerWidth?: number) {
  return getRowsLayoutConfig(containerWidth).spacing;
}

function getRowConstraints(containerWidth?: number) {
  return getRowsLayoutConfig(containerWidth).rowConstraints;
}

type PhotosGridProps = {
  photoId?: string;
  albumId?: string;
  onPhotosChange?: (photos: PhotoResponse[]) => void;
};

export function PhotosGrid({ photoId, albumId, onPhotosChange }: PhotosGridProps) {
  const { slug } = useParams();
  const pageSize = photoId ? 8 : 40;
  const firstVisible = 20;
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

const visiblePhotos = photos.slice(0, visibleCount);
const albumPhotos: GridAlbumPhoto[] = slug
  ? visiblePhotos.map((photo) => {
      const { width, height } = resolvePhotoDimensions(photo);

      return {
        key: photo.id,
        src: photoFileUrl(photo.id, slug),
        width,
        height,
        alt: photo.title?.trim() || "Photo",
        item: photo,
      };
    })
  : [];

return (
    <>
    {error && <div className="hp hp-error">{error}</div>}
    {photosLoading && (<div className="hp">Photos Loading…</div>)}
     <div className={`photos-preview ${hasHiddenInCurrent ? "is-clamped" : ""}`}>
      <RowsPhotoAlbum
        photos={albumPhotos}
        targetRowHeight={getTargetRowHeight}
        spacing={getRowSpacing}
        padding={0}
        rowConstraints={getRowConstraints}
        componentsProps={{ container: { className: "photos-rows" } }}
        render={{
          photo: (_, { photo, width, height, index }) => (
            <PhotoCard
              key={photo.key ?? `${photo.item.id}-${index}`}
              photo={photo.item}
              imageSrc={photo.src}
              width={width}
              height={height}
              onClick={() => openPhoto(photo.item.id, "modal", albumId)}
            />
          ),
        }}
      />

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
