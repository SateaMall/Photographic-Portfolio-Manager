import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMainPhoto } from "../../api/photoBrowse";
import type { MainPhotoResponse, Profile } from "../../types/types";
import { PhotosGrid } from "../../components/PhotosGrid";
import { photoFileUrl } from "../../api/photos";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import "./PhotoPage.css"
import { PROFILE_BY_ID } from "../../constants/constants";

type PhotoPageProps = {
  lightboxPortalContainer?: HTMLElement | null;
  lightboxKey?: string; // used to force remount when photoId changes, ensuring correct portal behavior
};
export default function PhotoPage({ lightboxPortalContainer , lightboxKey }: PhotoPageProps) {
  const { photoId } = useParams<{ photoId: string }>();
  const [mainPhoto, setMainPhoto] = useState<MainPhotoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mainProfile, setMainProfile] = useState<Profile | null>(null);

  if (!photoId) return;
  const image = photoFileUrl(photoId);
  useEffect(() => {
    if (!photoId) return;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const photo = await fetchMainPhoto(photoId);
        setMainPhoto(photo);
        setMainProfile(PROFILE_BY_ID[photo.owner]);
      } catch (e) {
        setError("Failed to load photo.");
      } finally {
        setLoading(false);
      }
    })();
  }, [photoId]);

  const title = mainPhoto?.title?.trim() || "Untitled";
  const description = mainPhoto?.description?.trim?.() || mainPhoto?.description || "—";
  const owner = mainProfile?.label || "—";
  const themes = mainPhoto?.themes ?? (mainPhoto as any)?.themeNames ?? [];
  const location = [mainPhoto?.city, mainPhoto?.country]
    .filter(Boolean)
    .join(", ") || "—";
  const captureYear = mainPhoto?.captureYear?? "—";

  if (!photoId) return null;

  return (
    <section className="photo-page">
      {loading && <div className="photo-page__status">Loading…</div>}
      {error && <div className="photo-page__status photo-page__status--error">{error}</div>}

      {!loading && !error && mainPhoto && (
        <>
          {/* Main viewer + metadata */}
          <div className="photo-page__hero">
            <div className="photo-page__viewer">
                            {/* Lightbox (inside modal portal container) */}
              <PhotoProvider
                key={lightboxKey} // important
                portalContainer={lightboxPortalContainer ?? undefined}
                maskClosable={true}
                photoClosable={true}
                >
                <PhotoView src={image}>
                  <button type="button" className="photo-page__imageBtn" aria-label="Open viewer">
                    <img
                      className="photo-page__image"
                      src={image}
                      alt={title}
                      loading="eager"
                      decoding="async"
                    />
                    <div className="photo-page__hint">
                      Click to fullscreen
                    </div>
                  </button>
                </PhotoView>
              </PhotoProvider>
            </div>

            <aside className="photo-page__meta" aria-label="Photo details">
              <h1 className="photo-page__title">{title}</h1>
              <p className="photo-page__desc">{description}</p>

              <dl className="photo-page__dl">
                <div className="photo-page__row">
                  <dt className="meta-headlines">Owner</dt>
                  <dd className="meta-info">{owner}</dd>
                </div>

                <div className="photo-page__row">
                  <dt className="meta-headlines">Themes</dt>
                  <dd>
                    {Array.isArray(themes) && themes.length > 0 ? (
                      <div className="photo-page__chips">
                        {themes.map((t: string) => (
                          <span key={t} className="photo-page__chip">
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>

                <div className="photo-page__row">
                  <dt className="meta-headlines">Location</dt>
                  <dd className="meta-info">{location}</dd>
                </div>

                <div className="photo-page__row">
                  <dt className="meta-headlines">Capture year</dt>
                  <dd className="meta-info">{captureYear}</dd>
                </div>
              </dl>
            </aside>
          </div>

          {/* Related suggestions */}
          <div className="photo-page__related">
            <h2 className="photo-page__h2">Related photos</h2>
            <PhotosGrid photoId={photoId} />
          </div>
        </>
      )}
    </section>
  );
}