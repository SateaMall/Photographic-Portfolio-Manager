import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { fetchPublicProfile } from "../../api/profiles";
import { fetchAlbumItemsAsPhotos, fetchMainPhoto } from "../../api/photoBrowse";
import type { MainPhotoResponse, PhotoResponse, PublicProfileResponse } from "../../types/types";
import { PhotosGrid } from "../../components/PhotosGrid";
import "./PhotoPage.css"
import { Navbar } from "../../components/navigationBar/Navbar";
import PhotoInfo from "./components/PhotoInfo";
import PhotoViewer from "./components/PhotoViewer";

type PhotoPageProps = {
  lightboxPortalContainer?: HTMLElement | null;
  lightboxKey?: string; // used to force remount when photoId changes, ensuring correct portal behavior
};
type Params = { slug?: string; photoId: string; albumId?: string };

export default function PhotoPage({ lightboxPortalContainer , lightboxKey }: PhotoPageProps) {
  const [mainProfile, setMainProfile] = useState<PublicProfileResponse | null>(null);
  const [mainPhoto, setMainPhoto] = useState<MainPhotoResponse | null>(null);

   // The album swipe list for PhotoViewer:
  const [photos, setPhotos] = useState<PhotoResponse[] | null>([]);

  const { slug, photoId, albumId } = useParams<Params>();
  const inAlbum = Boolean(albumId);

  const uselocation = useLocation();
  const isModalOpen = Boolean(uselocation.state?.backgroundLocation);
 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


      useEffect(() => {
        if (!photoId || !slug) return;
    
        setLoading(true);
        setError(null);
    
        (async () => {
          try {
            const [photo, profile] = await Promise.all([
              fetchMainPhoto(slug, photoId),
              fetchPublicProfile(slug),
            ]);

            setMainPhoto(photo);
            setMainProfile(profile);
            if (inAlbum && albumId) {
              // load album photos for swipe
              const albumPhotos = await fetchAlbumItemsAsPhotos(albumId); // you implement
              setPhotos(albumPhotos.content);
            } else {
              // home slug: keep photos empty or set to something relevant
              setPhotos([]);
            }
          } catch {
            setError("Failed to load photo.");
          } finally {
            setLoading(false);
          }
        })();
      }, [slug, photoId, inAlbum, albumId]);
    

  if (!photoId || !slug) return null;

  return (
    <section className={`photo-page ${!isModalOpen ? "background__noModule" : ""}`}>
      {!isModalOpen && <div className="navigationBar"><Navbar /></div>}
    
      {!loading && !error && mainPhoto && 
        (
          <>
            {/* Main viewer + metadata */}
            <div className="photo-page__hero">
              <div className="photo-page__viewer">
                <PhotoViewer photoId={photoId} profileSlug={slug} mainPhoto={mainPhoto} photos={photos} lightboxPortalContainer={lightboxPortalContainer} lightboxKey={lightboxKey} />
              </div>

              <div className="photo-page__meta" aria-label="Photo details">
                <PhotoInfo  mainPhoto={mainPhoto} mainProfile={mainProfile} />
              </div>
            </div>

            {/* Related suggestions */}
            { !inAlbum &&(
            <div className="photo-page__related">
              <h2 className="photo-page__h2">Related photos</h2>
              <PhotosGrid photoId={photoId} onPhotosChange={setPhotos} />
            </div>)}
          </>
        )
      }
    </section>
  );
}
