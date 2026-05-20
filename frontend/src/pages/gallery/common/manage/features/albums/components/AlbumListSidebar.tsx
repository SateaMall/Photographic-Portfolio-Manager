import { DndContext, closestCenter, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BsGripVertical } from "react-icons/bs";

import { photoFileUrl } from "../../../../../../../api/photos";
import type { AlbumViewResponse } from "../../../../../../../types/types";

type AlbumListSidebarProps = {
  albums: AlbumViewResponse[];
  profileSlug: string;
  activeAlbumId: string | null;
  albumListError: string | null;
  albumOrderError: string | null;
  albumOrderSaving: boolean;
  sensors: ReturnType<typeof useSensors>;
  onDragEnd: (event: DragEndEvent) => void;
  onSelect: (albumId: string) => void;
};

type SortableAlbumListItemProps = {
  albumSummary: AlbumViewResponse;
  profileSlug: string;
  isActive: boolean;
  dragDisabled: boolean;
  onSelect: (albumId: string) => void;
};

function SortableAlbumListItem({ albumSummary, profileSlug, isActive, dragDisabled, onSelect }: SortableAlbumListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: albumSummary.albumId,
    disabled: dragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const coverUrl = albumSummary.firstPhotoId
    ? photoFileUrl(albumSummary.firstPhotoId, profileSlug, "THUMB")
    : null;

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`manage-album-list__item ${isActive ? "is-active" : ""} ${isDragging ? "is-dragging" : ""}`}
    >
      <button
        type="button"
        className="manage-album-list__handle"
        aria-label={`Reorder ${albumSummary.title}`}
        disabled={dragDisabled}
        {...attributes}
        {...listeners}
      >
        <BsGripVertical />
      </button>

      <button type="button" className="manage-album-list__select" onClick={() => onSelect(albumSummary.albumId)}>
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
    </article>
  );
}

export function AlbumListSidebar({
  albums,
  profileSlug,
  activeAlbumId,
  albumListError,
  albumOrderError,
  albumOrderSaving,
  sensors,
  onDragEnd,
  onSelect,
}: AlbumListSidebarProps) {
  return (
    <section className="manage-card manage-card--compact manage-card--tight">
      <div className="manage-section__header">
        <div>
          <h2 className="manage-section__title">Collections</h2>
        </div>
        <p className="manage-hero__meta">{albums.length}</p>
      </div>

      {albumListError && <p className="manage-status manage-status--error">{albumListError}</p>}
      {albumOrderError && <p className="manage-status manage-status--error">{albumOrderError}</p>}
      {albumOrderSaving && <p className="manage-hero__meta">Saving collection order...</p>}

      {albums.length === 0 ? (
        <p className="manage-empty">No collections yet. Use the New collection link to create your first one.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={albums.map((albumSummary) => albumSummary.albumId)} strategy={verticalListSortingStrategy}>
            <div className="manage-album-list">
              {albums.map((albumSummary) => (
                <SortableAlbumListItem
                  key={albumSummary.albumId}
                  albumSummary={albumSummary}
                  profileSlug={profileSlug}
                  isActive={activeAlbumId === albumSummary.albumId}
                  dragDisabled={albumOrderSaving}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}
