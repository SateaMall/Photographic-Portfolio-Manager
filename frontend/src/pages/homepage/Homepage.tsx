import { useEffect, useState,useRef } from "react";
import { fetchAlbums} from "../../api/homepage";
import type { AlbumViewResponse, PhotoResponse } from "../../types/types";
import {AlbumsRow} from "./components/AlbumsRow"
import "./HomePage.css";
import { useParams } from "react-router-dom";
import { SocialBioSection } from "./components/SocialBioSection";
import { PhotosGrid } from "../../components/PhotosGrid";
import { CarrouselTopper } from "../../components/Carrousel/CarrouselTopper";
import { Navbar } from "../../components/NavigationBar/Navbar";
import { BsChevronDoubleDown  } from "react-icons/bs";
export default function Homepage() {

const { context } = useParams(); // "satea" | "alexis" | "shared"
const scope = context?.toUpperCase() as "SATEA" | "ALEXIS" | "SHARED";
const [error, setError] = useState<string | null>(null);




/**** **** **** **** ALBUMS **** **** **** ****/

  const [albums, setAlbums] = useState<AlbumViewResponse[]>([]);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  const [carrouselPhotos, setCarrouselPhotos] = useState<PhotoResponse[]>([]);
  useEffect(() => {
     setAlbumsLoading(true);
    fetchAlbums(scope)
      .then(setAlbums)
      .catch((e) => setError(e.message))
      .finally(() => setAlbumsLoading(false));
  }, [context]);

useEffect(() => {
  console.log("carrouselPhotos changed:", carrouselPhotos.length, carrouselPhotos);
}, [carrouselPhotos]);

  
  if (error) return <div className="hp hp-error">{error}</div>;


return (
  <div className="homepage">

    <div className="Topper">
      <div className="navbar-container">
        <Navbar />
      </div>
      
      <div className="carrousel-container">
        <CarrouselTopper carrouselPhotos={carrouselPhotos} />
      </div>
      <div className="bio-container">
        <SocialBioSection />
      </div>
      <button
        className="hero-scroll-indicator"
        onClick={() => {
          const el = document.getElementById("albums") 
            || document.getElementById("photos");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
        aria-label="Scroll down"
      >
         <BsChevronDoubleDown  />
      </button>
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
      <PhotosGrid onCarrouselPhotosChange={setCarrouselPhotos}/>
    </section>
  </div>

  </div>
);

}
