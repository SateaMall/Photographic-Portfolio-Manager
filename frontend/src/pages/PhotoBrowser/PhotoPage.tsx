import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { fetchAlbumItemsAsPhotos, fetchMainPhoto } from "../../api/photoBrowse";
import type { MainPhotoResponse, PhotoResponse, Profile } from "../../types/types";
import { PhotosGrid } from "../../components/PhotosGrid";
import "./PhotoPage.css"
import { PROFILE_BY_ID } from "../../constants/constants";
import { Navbar } from "../../components/NavigationBar/Navbar";
import PhotoInfo from "./components/PhotoInfo";
import PhotoViewer from "./components/PhotoViewer";

type PhotoPageProps = {
  lightboxPortalContainer?: HTMLElement | null;
  lightboxKey?: string; // used to force remount when photoId changes, ensuring correct portal behavior
};
type Params = { photoId: string; albumId?: string };

export default function PhotoPage({ lightboxPortalContainer , lightboxKey }: PhotoPageProps) {
  const [mainProfile, setMainProfile] = useState<Profile | null>(null);
  const [mainPhoto, setMainPhoto] = useState<MainPhotoResponse | null>(null);

   // The album swipe list for PhotoViewer:
  const [photos, setPhotos] = useState<PhotoResponse[] | null>([]);

  const { photoId, albumId } = useParams<Params>();
  const inAlbum = Boolean(albumId);

  const uselocation = useLocation();
  const isModalOpen = Boolean(uselocation.state?.backgroundLocation);
 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


      useEffect(() => {
        if (!photoId) return;
    
        setLoading(true);
        setError(null);
    
        (async () => {
          try {
            const photo = await fetchMainPhoto(photoId);
            setMainPhoto(photo);
            setMainProfile(PROFILE_BY_ID[photo.owner]);
            if (inAlbum && albumId) {
              // load album photos for swipe
              const albumPhotos = await fetchAlbumItemsAsPhotos(albumId); // you implement
              setPhotos(albumPhotos.content);
            } else {
              // home context: keep photos empty or set to something relevant
              setPhotos([]);
            }
          } catch (e) {
            setError("Failed to load photo.");
          } finally {
            setLoading(false);
          }
        })();
      }, [photoId, inAlbum, albumId]);
    

  if (!photoId) return null;

  return (
    <section className={`photo-page ${!isModalOpen ? "background__noModule" : ""}`}>
      {!isModalOpen && <div className="navigationBar"><Navbar /></div>}
    
      {!loading && !error && mainPhoto && 
        (
          <>
            {/* Main viewer + metadata */}
            <div className="photo-page__hero">
              <div className="photo-page__viewer">
                <PhotoViewer photoId={photoId} mainPhoto={mainPhoto} photos={photos} lightboxPortalContainer={lightboxPortalContainer} lightboxKey={lightboxKey} />
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