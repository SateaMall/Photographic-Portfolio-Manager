import { useParams } from "react-router-dom";
import { CarrouselTopper } from "../../../../components/carousel/CarrouselTopper";
import { ScrollIndicator } from "../../../../components/Indicator/ScrollIndicator";
import { useGalleryProfile } from "../../../../layouts/GalleryProfileContext";
import { Navbar } from "../navigation/Navbar";
import { PhotosGrid } from "../../common/components/PhotosGrid";

import "./AlbumPage.css"
import { fetchAlbumInfo } from "../../../../api/photo-album";
import type { AlbumViewResponse, PhotoResponse } from "../../../../types/types";
import { useEffect, useState } from "react";
import { AlbumInfo } from "./components/AlbumInfo";

export default function AlbumPage() {
  const { albumId } = useParams<{slug: string; albumId: string;}>();
  const { profile } = useGalleryProfile();
  const [album, setAlbum] = useState <AlbumViewResponse| null>(null);
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);

   useEffect (() => {
    if (!albumId) return;
    let cancelled = false;
    (async () =>{
      try{
        const albumInfo= await fetchAlbumInfo(albumId);
        if (!cancelled) setAlbum(albumInfo);
      }catch(e){
        console.error("Failed to fetch album info:", e);
      }
    })();
    return () => {
    cancelled = true;
  };
  }, [albumId])

  useEffect(() => {
    if (!album) return;
    document.title = album.title?.trim() || "Let Me Lens";
  }, [album]);

  return (
    <div className="AlbumPage">
    
        <div className="Topper">
          <div className="navbar-container">
            <Navbar />
          </div>
          
          <div className="carrousel-container">
            <CarrouselTopper carrouselPhotos={photos.slice(0,5)} />
          </div>
          <div className="album-info-container">
            <AlbumInfo album={album} displayName={profile.displayName ?? null} />
          </div>
          <div className="scroll-indicator">
            <ScrollIndicator targetId={["photos"]} />
          </div>
        </div>
      
      <section className="content" id="photos">
        <header className="hp-head__album">
          <h1 className="hp-title__album ">Album photos</h1>
        </header>
          {/* Photos */}
        <PhotosGrid albumId={albumId} onPhotosChange={setPhotos}/>
      </section>
    </div>
 
  );
}
