import { useEffect, useState } from "react";
import { fetchAlbums} from "../../../api/profile";
import type { AlbumViewResponse, PhotoResponse } from "../../../types/types";
import {AlbumsRow} from "../profile/components/AlbumsRow"
import "./ProfilePage.css";
import { useParams } from "react-router-dom";
import { SocialBioSection } from "../profile/components/SocialBioSection";
import { PhotosGrid } from "../components/PhotosGrid";
import { CarrouselTopper } from "../../../components/carousel/CarrouselTopper";
import { Navbar } from "../components/navigation/Navbar";
import { ScrollIndicator } from "../../../components/indicator/ScrollIndicator";

type AlbumState = {
  slug: string;
  albums: AlbumViewResponse[];
  error: string | null;
};

export default function Profilepage() {

const { slug } = useParams() 
const profileSlug = slug?.trim().toLowerCase() ?? "";


/**** **** **** **** ALBUMS **** **** **** ****/

  const [albumState, setAlbumState] = useState<AlbumState | null>(null);
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);

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

  const currentAlbumState = albumState?.slug === profileSlug ? albumState : null;
  const albums = currentAlbumState?.albums ?? [];
  const albumsLoading = Boolean(profileSlug) && currentAlbumState === null;
  const error = currentAlbumState?.error ?? null;


   
  if (error) return <div className="hp hp-error">{error}</div>;


return (
  <div className="profilepage">

    <div className="Topper">
      <div className="navbar-container">
        <Navbar />
      </div>
      
      <div className="carrousel-container">
        <CarrouselTopper carrouselPhotos={photos.slice(0,5)} />
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
    {albums.length!==0 && (
      <section className="hp-section-album"  id="albums">
      <header className="hp-head-album">
        <h1 className="hp-title">Albums</h1>
      </header>
      {albumsLoading && (<div className="hp">Albums Loading…</div>)}
       <AlbumsRow albums={albums} />
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
