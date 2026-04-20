import { closestCenter } from "@dnd-kit/core";
import { Link } from "react-router-dom";

import type { AlbumViewResponse, ManagedAlbumResponse, ManagedPhotoResponse } from "../../../../../../../types/types";
import { getPublicAlbumPath } from "../../../shared/utils/manageRoute";
import { PhotoUploadQueue } from "../../photos/components/PhotoUploadQueue";
import { useAlbumEditor } from "../hooks/useAlbumEditor";
import { AlbumDetailsForm } from "./AlbumDetailsForm";
import { AlbumOrderSection } from "./AlbumOrderSection";
import { AlbumPhotoLibrarySection } from "./AlbumPhotoLibrarySection";

type AlbumEditorPanelProps = {
  profileSlug: string;
  album: ManagedAlbumResponse;
  allPhotos: ManagedPhotoResponse[];
  onRefreshAlbums: () => Promise<AlbumViewResponse[]>;
  onRefreshAlbum: (albumId: string) => Promise<ManagedAlbumResponse>;
  onRefreshPhotoLibrary: () => Promise<ManagedPhotoResponse[]>;
  onDeleteAlbum: (albumId: string) => Promise<void>;
};

export function AlbumEditorPanel({
  profileSlug,
  album,
  allPhotos,
  onRefreshAlbums,
  onRefreshAlbum,
  onRefreshPhotoLibrary,
  onDeleteAlbum,
}: AlbumEditorPanelProps) {
  const {
    deleting,
    description,
    drafts,
    error,
    isBusy,
    libraryPhotoIds,
    onDelete,
    onDragEnd,
    onSave,
    orderedPhotoIds,
    orderedPhotos,
    saving,
    sensors,
    setDescription,
    setDrafts,
    setTitle,
    success,
    title,
    togglePhoto,
  } = useAlbumEditor({ album, allPhotos, onRefreshAlbums, onRefreshAlbum, onRefreshPhotoLibrary, onDeleteAlbum });

  return (
    <div className="manage-detail">
      <AlbumDetailsForm
        title={title}
        description={description}
        disabled={isBusy}
        saving={saving}
        deleting={deleting}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onSave={onSave}
        onDelete={onDelete}
      />

      <AlbumOrderSection
        profileSlug={profileSlug}
        orderedPhotoIds={orderedPhotoIds}
        orderedPhotos={orderedPhotos}
        disabled={isBusy}
        saving={saving}
        sensors={sensors}
        onDragEnd={onDragEnd}
        onRemove={togglePhoto}
        onSave={onSave}
        collisionDetection={closestCenter}
      />

      <AlbumPhotoLibrarySection
        profileSlug={profileSlug}
        allPhotos={allPhotos}
        libraryPhotoIds={libraryPhotoIds}
        disabled={isBusy}
        onToggle={togglePhoto}
      />

      <PhotoUploadQueue drafts={drafts} onDraftsChange={setDrafts} disabled={isBusy} />

      {error && <p className="manage-status manage-status--error">{error}</p>}
      {success && <p className="manage-status manage-status--success">{success}</p>}

      <div className="manage-actions">
        <div className="manage-actions__group">
          <button type="button" className="manage-button manage-button--primary" onClick={onSave} disabled={isBusy}>
            {saving ? "Saving..." : "Save album"}
          </button>
        </div>

        <div className="manage-actions__group">
          <Link className="manage-button manage-button--ghost" to={getPublicAlbumPath(profileSlug, album.albumId)}>
            View collection
          </Link>
        </div>
      </div>
    </div>
  );
}
