import { Link } from "react-router-dom";

import { useManageAccess } from "../../../shared/hooks/useManageAccess";
import { getGalleryPath } from "../../../shared/utils/manageRoute";
import { CarouselLibrarySection } from "../components/CarouselLibrarySection";
import { CarouselSelectionSection } from "../components/CarouselSelectionSection";
import { closestCenter, useCarouselWorkspace } from "../hooks/useCarouselWorkspace";
import "../../../ManagePage.css";

export default function ProfileCarouselPage() {
  const { authLoading, canManage, profileSlug } = useManageAccess();
  const {
    error,
    loading,
    onDragEnd,
    onSave,
    photoLibrary,
    saving,
    selectedHeroIds,
    selectedHeroPhotos,
    sensors,
    success,
    toggleHeroPhoto,
  } = useCarouselWorkspace({ profileSlug, canManage, authLoading });

  if (authLoading || loading) {
    return <p className="manage-empty">Loading carousel settings...</p>;
  }

  if (!canManage) {
    return <p className="manage-status manage-status--error">This page is only available for your own main profile.</p>;
  }

  return (
    <div className="manage-panel">
      <header className="manage-hero manage-hero--panel">
        <p className="manage-hero__eyebrow">Manage Slides</p>
        <h1 className="manage-hero__title">Organise slides at the top of your profile.</h1>
        <p className="manage-hero__meta">If the hero carousel is empty, the profile page shows the first photos from your gallery.</p>
      </header>

      <CarouselSelectionSection
        profileSlug={profileSlug}
        selectedHeroPhotos={selectedHeroPhotos}
        selectedHeroIds={selectedHeroIds}
        saving={saving}
        sensors={sensors}
        onDragEnd={onDragEnd}
        onRemove={toggleHeroPhoto}
        onSave={onSave}
        collisionDetection={closestCenter}
      />

      <CarouselLibrarySection profileSlug={profileSlug} photos={photoLibrary} saving={saving} onAdd={toggleHeroPhoto} />

      {error && <p className="manage-status manage-status--error">{error}</p>}
      {success && <p className="manage-status manage-status--success">{success}</p>}

      <div className="manage-actions">
        <div className="manage-actions__group">
          <button type="button" className="manage-button manage-button--primary" onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save carousel"}
          </button>
        </div>

        <div className="manage-actions__group">
          <Link className="manage-button manage-button--ghost" to={getGalleryPath(profileSlug)}>
            View profile
          </Link>
        </div>
      </div>
    </div>
  );
}
