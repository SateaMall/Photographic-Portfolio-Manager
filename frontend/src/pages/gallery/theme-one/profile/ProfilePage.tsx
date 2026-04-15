import { useEffect, useState } from "react";
import { fetchAlbums, fetchProfileHeroPhotos } from "../../../../api/profile";
import type { AlbumViewResponse, PhotoResponse } from "../../../../types/types";
import {AlbumsRow} from "./components/AlbumsRow"
import "./ProfilePage.css";
import { useParams } from "react-router-dom";
import { SocialBioSection } from "./components/SocialBioSection";
import { PhotosGrid } from "../../components/PhotosGrid";
import { CarrouselTopper } from "../../../../components/carousel/CarrouselTopper";
import { Navbar } from "../navigation/Navbar";
import { ScrollIndicator } from "../../../../components/indicator/ScrollIndicator";
import { useAuth } from "../../../../auth/AuthContext";

type AlbumState = {
  slug: string;
  albums: AlbumViewResponse[];
  error: string | null;
};

export default function Profilepage() {

const { slug } = useParams() 
const profileSlug = slug?.trim().toLowerCase() ?? "";
const { session, isAuthenticated } = useAuth();
const canManage = isAuthenticated && session.profileSlug?.trim().toLowerCase() === profileSlug;


/**** **** **** **** ALBUMS **** **** **** ****/

  const [albumState, setAlbumState] = useState<AlbumState | null>(null);
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [heroPhotoState, setHeroPhotoState] = useState<{ slug: string; photos: PhotoResponse[] } | null>(null);

  useEffect(() => {
    if (!profileSlug) {
       return () => {};
     }

    let cancelled = false;

    fetchAlbums(profileSlug)
      .then((albums) => {
        if (!cancelled) {
          setAlbumState({ slug: profileSlug, albums, error: null });
        }
      })
      .catch((caughtError) => {
        if (!cancelled) {
          setAlbumState({
            slug: profileSlug,
            albums: [],
            error: caughtError instanceof Error ? caughtError.message : "Failed to load albums.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [profileSlug]);

  useEffect(() => {
    if (!profileSlug) {
      return () => {};
    }

    let cancelled = false;

    fetchProfileHeroPhotos(profileSlug)
      .then((heroPhotos) => {
        if (!cancelled) {
          setHeroPhotoState({ slug: profileSlug, photos: heroPhotos });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHeroPhotoState({ slug: profileSlug, photos: [] });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [profileSlug]);

  const currentAlbumState = albumState?.slug === profileSlug ? albumState : null;
  const albums = currentAlbumState?.albums ?? [];
  const error = currentAlbumState?.error ?? null;
  const heroPhotos = heroPhotoState?.slug === profileSlug ? heroPhotoState.photos : [];
  const topperPhotos = heroPhotos.length > 0 ? heroPhotos : photos.slice(0,5);


   
  if (error) return <div className="hp hp-error">{error}</div>;


return (
  <div className="profilepage">

    <div className="Topper">
      <div className="navbar-container">
        <Navbar />
      </div>
      
      <div className="carrousel-container">
        <CarrouselTopper carrouselPhotos={topperPhotos} />
      </div>
      <div className="bio-container">
        <SocialBioSection />
      </div>
      <div className="scroll-indicator">
        <ScrollIndicator targetId={["albums", "photos"]} />
      </div>
    </div>
  
  <div className="content">
      {/* Albums */}
    {(albums.length !== 0 || canManage) && (
      <section className="hp-section-album"  id="albums">
      <header className="hp-head-album">
        <h1 className="hp-title">Collecitons</h1>
      </header>
      {albums.length !== 0 ? (
        <AlbumsRow albums={albums} />
      ) : (
        <div className="hp hp-empty">No collections yet.</div>
      )}
    </section> 
    )}

    {/* Photos */}
    <section className="hp-section"  id="photos">
      <header className="hp-head">
        <h1 className="hp-title ">Photos</h1>
      </header>
      <PhotosGrid onPhotosChange={setPhotos}/>
    </section>
  </div>

  </div>
);

}
