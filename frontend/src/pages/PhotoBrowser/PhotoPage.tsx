import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { fetchMainPhoto } from "../../api/photoBrowse";
import type { MainPhotoResponse, PhotoResponse, Profile } from "../../types/types";
import { PhotosGrid } from "../../components/PhotosGrid";
import { photoFileUrl } from "../../api/photos";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import "./PhotoPage.css"
import { PROFILE_BY_ID } from "../../constants/constants";
import { Navbar } from "../../components/NavigationBar/Navbar";

type PhotoPageProps = {
  lightboxPortalContainer?: HTMLElement | null;
  lightboxKey?: string; // used to force remount when photoId changes, ensuring correct portal behavior
};
export default function PhotoPage({ lightboxPortalContainer , lightboxKey }: PhotoPageProps) {
  const uselocation = useLocation();
  const isModalOpen = Boolean(uselocation.state?.backgroundLocation);
  const { photoId, context } = useParams<{ photoId: string; context?: string }>();
  const [mainPhoto, setMainPhoto] = useState<MainPhotoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mainProfile, setMainProfile] = useState<Profile | null>(null);
  const profile = context ? PROFILE_BY_ID[context.toUpperCase() as keyof typeof PROFILE_BY_ID] : null;  
  const [photos, setPhotos] = useState<PhotoResponse[] | null>([]);
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
  const description = mainPhoto?.description?.trim?.() || mainPhoto?.description ;
  const owner = mainProfile?.label ;
  const themes = mainPhoto?.themes ?? (mainPhoto as any)?.themeNames ?? [];
  const location = [mainPhoto?.city, mainPhoto?.country]
    .filter(Boolean)
    .join(", ") ;
  const captureYear = mainPhoto?.captureYear;

  if (!photoId) return null;

  return (
    <section className={`photo-page ${!isModalOpen ? "background__noModule" : ""}`}
      style={{ ["--primaryColor" as any]: profile?.avatar?.primaryColor  ?? "#111827" ,
      ["--secondaryColor" as any]: profile?.avatar?.secondaryColor}}
    >
      {!isModalOpen && <div className="navigationBar"><Navbar /></div>}
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
                      Click to fullscreen / zoom
                    </div>
                  </button>
                </PhotoView>
              {photos && photos.length > 0 && photos.map((src) => (
                <PhotoView key={src.id} src={photoFileUrl(src.id)}>
                  <span style={{ display: "none" }}></span>
                </PhotoView>
              ))}
              </PhotoProvider>
            </div>

            <div className="photo-page__meta" aria-label="Photo details">


              <div className="photo-page__subline">
                <h1 className="photo-page__title">{title}</h1>
                <span className="meta-sep">•</span>
                <span className="meta-pill"> {location}</span>
                <span className="meta-sep">•</span>
                <span className="meta-pill"> {captureYear}</span>
                <span className="meta-sep">•</span>
                <span className="meta-pill"> {owner}</span>
              </div>
              <details className="meta-details">
              <summary className="meta-summary">More details</summary>
              <p className="photo-page__desc">{description}</p>
                <dl className="photo-page__dl">
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
                </dl>
              </details>
            </div>
          </div>

          {/* Related suggestions */}
          <div className="photo-page__related">
            <h2 className="photo-page__h2">Related photos</h2>
            <PhotosGrid photoId={photoId} onPhotosChange={setPhotos} />
          </div>
        </>
      )}
    </section>
  );
}