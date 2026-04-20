import { photoFileUrl } from "../../../../../../../api/photos";
import type { AlbumViewResponse } from "../../../../../../../types/types";

type AlbumListSidebarProps = {
  albums: AlbumViewResponse[];
  profileSlug: string;
  activeAlbumId: string | null;
  albumListError: string | null;
  onSelect: (albumId: string) => void;
};

export function AlbumListSidebar({ albums, profileSlug, activeAlbumId, albumListError, onSelect }: AlbumListSidebarProps) {
  return (
    <section className="manage-card manage-card--compact manage-card--tight">
      <div className="manage-section__header">
        <div>
          <h2 className="manage-section__title">Collections</h2>
          <p className="manage-section__copy">Choose a collection to manage and order its content.</p>
        </div>
        <p className="manage-hero__meta">{albums.length}</p>
      </div>

      {albumListError && <p className="manage-status manage-status--error">{albumListError}</p>}

      {albums.length === 0 ? (
        <p className="manage-empty">No collections yet. Use the New collection link to create your first one.</p>
      ) : (
        <div className="manage-collection-list">
          {albums.map((albumSummary) => {
            const coverUrl = albumSummary.firstPhotoId
              ? photoFileUrl(albumSummary.firstPhotoId, profileSlug, "THUMB")
              : null;

            return (
              <button
                key={albumSummary.albumId}
                type="button"
                className={`manage-album-list__item ${activeAlbumId === albumSummary.albumId ? "is-active" : ""}`}
                onClick={() => onSelect(albumSummary.albumId)}
              >
                {coverUrl ? (
                  <img className="manage-album-list__thumb" src={coverUrl} alt={albumSummary.title} loading="lazy" />
                ) : (
                  <div className="manage-album-list__thumb manage-album-list__thumb--empty">No cover</div>
                )}

                <div className="manage-album-list__body">
                  <h3 className="manage-album-list__title">{albumSummary.title}</h3>
                  <p className="manage-album-list__meta">{albumSummary.numberOfPhotos} photo{albumSummary.numberOfPhotos === 1 ? "" : "s"}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
