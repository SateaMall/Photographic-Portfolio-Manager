import { closestCenter } from "@dnd-kit/core";
import { Link } from "react-router-dom";

import type { AlbumViewResponse, ManagedAlbumResponse, ManagedPhotoResponse } from "../../../../../../../types/types";
import { getManagePhotosPath, getPublicAlbumPath } from "../../../shared/utils/manageRoute";
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
  onDeleteAlbum: (albumId: string) => Promise<void>;
};

export function AlbumEditorPanel({
  profileSlug,
  album,
  allPhotos,
  onRefreshAlbums,
  onRefreshAlbum,
  onDeleteAlbum,
}: AlbumEditorPanelProps) {
  const {
    deleting,
    description,
    error,
    hasPendingPhotoChanges,
    isBusy,
    isPhotoBusy,
    libraryPhotoIds,
    onDelete,
    onDragEnd,
    onSaveDetails,
    orderedPhotoIds,
    orderedPhotos,
    retryPhotoSave,
    savingDetails,
    savingPhotos,
    sensors,
    setDescription,
    setTitle,
    success,
    title,
    togglePhoto,
  } = useAlbumEditor({ album, allPhotos, onRefreshAlbums, onRefreshAlbum, onDeleteAlbum });

  return (
    <div className="manage-detail">
      <AlbumDetailsForm
        title={title}
        description={description}
        disabled={isBusy}
        savingDetails={savingDetails}
        deleting={deleting}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onSave={onSaveDetails}
        onDelete={onDelete}
      />

      <AlbumOrderSection
        profileSlug={profileSlug}
        orderedPhotoIds={orderedPhotoIds}
        orderedPhotos={orderedPhotos}
        disabled={isPhotoBusy}
        sensors={sensors}
        onDragEnd={onDragEnd}
        onRemove={togglePhoto}
        collisionDetection={closestCenter}
      />

      <AlbumPhotoLibrarySection
        profileSlug={profileSlug}
        allPhotos={allPhotos}
        libraryPhotoIds={libraryPhotoIds}
        disabled={isPhotoBusy}
        onToggle={togglePhoto}
      />

      {savingPhotos && <p className="manage-hero__meta">Saving collection changes...</p>}
      {error && <p className="manage-status manage-status--error">{error}</p>}
      {success && <p className="manage-status manage-status--success">{success}</p>}

      <div className="manage-actions">
        {error && hasPendingPhotoChanges && (
          <div className="manage-actions__group">
            <button type="button" className="manage-button manage-button--primary" onClick={retryPhotoSave} disabled={isPhotoBusy}>
              Retry save
            </button>
          </div>
        )}

        <div className="manage-actions__group">
          <Link className="manage-button manage-button--secondary" to={`${getManagePhotosPath(profileSlug)}#queue`}>
            Add new photo
          </Link>
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
