import type { AlbumViewResponse } from "../../../types/types";
import { photoFileUrl } from "../../../api/photos";
import { useNavigate, useParams } from "react-router-dom";


import "./AlbumCard.css";

export function AlbumCard({ album }: { album: AlbumViewResponse }) {
  const navigate = useNavigate();
  const { slug } = useParams();
  if (!slug) return null;
  const cover = album.firstPhotoId ? photoFileUrl(album.firstPhotoId, slug) : null;

  function onClickAlbum (){
    
    navigate(`album/${album.albumId}`);

  }
  return (
    <article className="album-card" onClick={onClickAlbum}>
      {cover ? (
        <img className="album-cover" src={cover} alt={album.title} loading="lazy" />
      ) : (
        <div className="album-cover album-cover--empty">No cover</div>
      )}

      <div className="album-meta">
         <div className="album-title">{album.title}</div>
         <div className="album-sub">
           <div className="album-count">
             {album.numberOfPhotos} photo{album.numberOfPhotos === 1 ? "" : "s"}
           </div>
         </div>
       </div>
    </article>
  );
}
