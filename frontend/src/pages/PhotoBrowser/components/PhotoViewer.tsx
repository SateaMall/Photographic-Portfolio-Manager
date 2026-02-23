import { PhotoProvider, PhotoView } from "react-photo-view"
import { photoFileUrl } from "../../../api/photos";
import type { MainPhotoResponse, PhotoResponse } from "../../../types/types";
import "./PhotoViewer.css"
import "react-photo-view/dist/react-photo-view.css";
import { useMemo } from "react";
type PhotoViewerProps = {
  photoId: string;
  mainPhoto: MainPhotoResponse | null;
  photos: PhotoResponse[] | null | [];
  lightboxPortalContainer?: HTMLElement | null;
  lightboxKey?: string; // used to force remount when photoId changes, ensuring correct portal behavior
};

export default function PhotoViewer({ photoId, mainPhoto,photos, lightboxPortalContainer, lightboxKey }: PhotoViewerProps) {

    const ordered = useMemo(() => {
        const list = (photos ?? []).slice(); // copy
        const idx = list.findIndex(p => p.id === photoId);
        // If the current photo isn't in the list (common if you filtered it out),
        // insert it at the beginning as a fallback.
        if (idx === -1) {
        return [{ id: photoId } as PhotoResponse, ...list];
        }
        return list;
    }, [photos, photoId]);



  return (
    <div className="photo-page__viewer">
      <PhotoProvider
        key={lightboxKey}
        portalContainer={lightboxPortalContainer ?? undefined}
        maskClosable
        photoClosable
      >
        {/* Render ALL PhotoViews in the correct order */}
        {ordered.map((p) => {
          const src = photoFileUrl(p.id);

          const isCurrent = p.id === photoId;
          if (isCurrent) {
            return (
                <div key={p.id} className="photo-page__mainPhotoWrapper">
                    <PhotoView key={p.id} src={src} >
                        <button type="button" className="photo-page__imageBtn" aria-label="Open viewer">
                        <img
                            className="photo-page__image"
                            src={src}
                            alt={mainPhoto?.title?.trim() || "Untitled"}
                            loading="eager"
                            decoding="async"
                        />
                        <div className="photo-page__hint">Click to fullscreen / zoom</div>
                        </button>
                    </PhotoView>
                </div>
            );
          }

          // Hidden PhotoViews to register them in the gallery order
          return (
            <PhotoView key={p.id} src={src}>
               <span style={{ display: "none" }} />
            </PhotoView>
          );
        })}
      </PhotoProvider>
    </div>
  );
}