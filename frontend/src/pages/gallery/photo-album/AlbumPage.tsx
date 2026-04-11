import { Link, useParams } from "react-router-dom";
import { CarrouselTopper } from "../../../components/carousel/CarrouselTopper";
import { ScrollIndicator } from "../../../components/indicator/ScrollIndicator";
import { Navbar } from "../components/navigation/Navbar";
import { PhotosGrid } from "../components/PhotosGrid";

import "./AlbumPage.css"
import { fetchAlbumInfo } from "../../../api/photo-album";
import type { AlbumViewResponse, PhotoResponse } from "../../../types/types";
import { useEffect, useState } from "react";
import { AlbumInfo } from "./components/AlbumInfo";
import { useAuth } from "../../../auth/AuthContext";

export default function AlbumPage() {
  const { slug, albumId } = useParams<{slug: string; albumId: string;}>();
  const [album, setAlbum] = useState <AlbumViewResponse| null>(null);
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const { session, isAuthenticated } = useAuth();
  const canManage = isAuthenticated && session.profileSlug?.trim().toLowerCase() === slug?.trim().toLowerCase();

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
            <AlbumInfo album={album}/>
          </div>
          <div className="scroll-indicator">
            <ScrollIndicator targetId={["photos"]} />
          </div>
        </div>
      
      <section className="content" id="photos">
        <header className="hp-head__album">
          <h1 className="hp-title__album ">Album photos</h1>
          {canManage && albumId && slug && (
            <Link className="hp-manage-link__album" to={`/${slug}/manage/albums/${albumId}`}>
              Configure album
            </Link>
          )}
        </header>
          {/* Photos */}
        <PhotosGrid albumId={albumId} onPhotosChange={setPhotos}/>
      </section>
    </div>
 
  );
}
