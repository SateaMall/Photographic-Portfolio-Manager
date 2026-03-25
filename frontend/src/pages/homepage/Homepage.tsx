import { useEffect, useState } from "react";
import { fetchAlbums} from "../../api/homepage";
import type { AlbumViewResponse, PhotoResponse } from "../../types/types";
import {AlbumsRow} from "./components/AlbumsRow"
import "./HomePage.css";
import { useParams } from "react-router-dom";
import { SocialBioSection } from "./components/SocialBioSection";
import { PhotosGrid } from "../../components/PhotosGrid";
import { CarrouselTopper } from "../../components/Carrousel/CarrouselTopper";
import { Navbar } from "../../components/NavigationBar/Navbar";
import { ScrollIndicator } from "../../components/Indicator/ScrollIndicator";
export default function Homepage() {

const { context } = useParams(); // "satea" | "alexis" | "shared"
const scope = context?.toUpperCase() as "SATEA" | "ALEXIS" | "SHARED";
const [error, setError] = useState<string | null>(null);




/**** **** **** **** ALBUMS **** **** **** ****/

  const [albums, setAlbums] = useState<AlbumViewResponse[]>([]);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  useEffect(() => {
     setAlbumsLoading(true);
    fetchAlbums(scope)
      .then(setAlbums)
      .catch((e) => setError(e.message))
      .finally(() => setAlbumsLoading(false));
  }, [context]);


  
  if (error) return <div className="hp hp-error">{error}</div>;


return (
  <div className="homepage">

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
