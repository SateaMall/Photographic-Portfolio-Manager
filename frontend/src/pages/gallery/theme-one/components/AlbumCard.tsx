import type { AlbumViewResponse } from "../../../../types/types";
import { photoFileUrl } from "../../../../api/photos";
import { Link, useParams } from "react-router-dom";


import "./AlbumCard.css";

export function AlbumCard({ album }: { album: AlbumViewResponse }) {
  const { slug } = useParams();
  if (!slug) return null;
  const cover = album.firstPhotoId ? photoFileUrl(album.firstPhotoId, slug) : null;

  // draggable={false} keeps the native link drag from fighting the carousel swipe
  return (
    <Link className="album-card" to={`/${slug}/album/${album.albumId}`} draggable={false}>
      {cover ? (
        <img className="album-cover" src={cover} alt={album.title} loading="lazy" draggable={false} />
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
    </Link>
  );
}
