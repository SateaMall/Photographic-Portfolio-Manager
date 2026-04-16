import { useLocation, useNavigate, useParams } from "react-router-dom";

import { useManageAccess } from "../../../shared/hooks/useManageAccess";
import { getManageAlbumPath } from "../../../shared/utils/manageRoute";
import { AlbumEditorPanel } from "../components/AlbumEditorPanel";
import { AlbumListSidebar } from "../components/AlbumListSidebar";
import { NewAlbumForm } from "../components/NewAlbumForm";
import { useAlbumsWorkspace } from "../hooks/useAlbumsWorkspace";
import "../../../ManagePage.css";

export default function ManageAlbumsPage() {
  const { albumId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { authLoading, canManage, profileSlug } = useManageAccess();
  const {
    activeAlbumId,
    albumListError,
    albumListLoading,
    albums,
    allPhotos,
    createError,
    creating,
    handleCreateAlbum,
    handleDeleteAlbum,
    isCreateOpen,
    newAlbumDescription,
    newAlbumTitle,
    photoLibraryError,
    photoLibraryLoading,
    refreshAlbum,
    refreshAlbums,
    refreshPhotoLibrary,
    selectedAlbum,
    selectedAlbumError,
    selectedAlbumLoading,
    setNewAlbumDescription,
    setNewAlbumTitle,
  } = useAlbumsWorkspace({
    profileSlug,
    albumId,
    locationHash: location.hash,
    canManage,
    authLoading,
    navigate,
  });

  return (
    <div className="manage-panel">
      <header className="manage-hero manage-hero--panel">
        <p className="manage-hero__eyebrow">Album configuration</p>
        <h1 className="manage-hero__title">Manage your collections</h1>
      </header>

      {!authLoading && !canManage && (
        <p className="manage-status manage-status--error">This page is only available for your own main profile.</p>
      )}

      {(albumListLoading || photoLibraryLoading) && <p className="manage-empty">Loading collection workspace...</p>}

      {!authLoading && canManage && !albumListLoading && !photoLibraryLoading && (
        <div className="manage-workspace">
          <aside className="manage-sidebar">
            {isCreateOpen && (
              <NewAlbumForm
                title={newAlbumTitle}
                description={newAlbumDescription}
                creating={creating}
                error={createError}
                onTitleChange={setNewAlbumTitle}
                onDescriptionChange={setNewAlbumDescription}
                onCreate={handleCreateAlbum}
              />
            )}

            <AlbumListSidebar
              albums={albums}
              profileSlug={profileSlug}
              activeAlbumId={activeAlbumId}
              albumListError={albumListError}
              onSelect={(targetAlbumId) => navigate(getManageAlbumPath(profileSlug, targetAlbumId))}
            />
          </aside>

          {photoLibraryError && <p className="manage-status manage-status--error">{photoLibraryError}</p>}

          {selectedAlbumLoading ? (
            <div className="manage-card manage-detail">
              <p className="manage-empty">Loading collection editor...</p>
            </div>
          ) : selectedAlbumError ? (
            <div className="manage-card manage-detail">
              <p className="manage-status manage-status--error">{selectedAlbumError}</p>
            </div>
          ) : selectedAlbum ? (
            <AlbumEditorPanel
              key={selectedAlbum.albumId}
              profileSlug={profileSlug}
              album={selectedAlbum}
              allPhotos={allPhotos}
              onRefreshAlbums={refreshAlbums}
              onRefreshAlbum={refreshAlbum}
              onRefreshPhotoLibrary={refreshPhotoLibrary}
              onDeleteAlbum={handleDeleteAlbum}
            />
          ) : (
            <div className="manage-card manage-detail">
              <p className="manage-empty">Select a collection from the left or open New collection.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
