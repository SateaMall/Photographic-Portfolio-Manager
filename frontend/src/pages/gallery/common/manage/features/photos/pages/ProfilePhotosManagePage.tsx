import { useState } from "react";
import { closestCenter } from "@dnd-kit/core";
import { useLocation } from "react-router-dom";

import { uploadManagedPhoto } from "../../../../../../../api/manage";
import { useOpenPhoto } from "../../../../../../../layouts/components/popup/useOpenPhoto";
import { useManageAccess } from "../../../shared/hooks/useManageAccess";
import { useManagePhotoGrid } from "../hooks/useManagePhotoGrid";
import { useUploadDraftQueue } from "../../../shared/hooks/useUploadDraftQueue";
import { readErrorMessage } from "../../../shared/utils/manageErrors";
import "../../../ManagePage.css";
import { PhotoOrderSection } from "../components/PhotoOrderSection";
import { PhotoUploadSection } from "../components/PhotoUploadSection";

export default function ProfilePhotosManagePage() {
  const location = useLocation();
  const openPhoto = useOpenPhoto();
  const { authLoading, canManage, profileSlug } = useManageAccess();
  const { drafts, keepDraftsById, setDrafts } = useUploadDraftQueue();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const {
    error: orderError,
    loading: orderLoading,
    onDragEnd,
    photos,
    refreshPhotos,
    saveOrder,
    saving: orderSaving,
    sensors,
    success: orderSuccess,
  } = useManagePhotoGrid({ profileSlug, canManage, authLoading });
  const isQueueOpen = location.hash === "#queue";

  async function onSave() {
    if (drafts.length === 0) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    const failedDraftIds = new Set<string>();
    let savedCount = 0;

    for (const draft of drafts) {
      try {
        await uploadManagedPhoto(draft);
        savedCount += 1;
      } catch (caughtError) {
        failedDraftIds.add(draft.id);
        setError(readErrorMessage(caughtError, `Failed to upload ${draft.file.name}.`));
      }
    }

    keepDraftsById(failedDraftIds);

    if (savedCount > 0 && failedDraftIds.size === 0) {
      setSuccess(`Saved ${savedCount} photo${savedCount === 1 ? "" : "s"}.`);
    } else if (savedCount > 0) {
      setSuccess(`Saved ${savedCount} photo${savedCount === 1 ? "" : "s"}. Failed uploads stayed in the queue.`);
    }

    if (savedCount > 0) {
      try {
        await refreshPhotos();
      } catch {
        // Keep upload success state even if the ordering preview does not refresh immediately.
      }
    }

    setSaving(false);
  }

  return (
    <div className="manage-panel">
      <header className="manage-hero manage-hero--panel">
        <p className="manage-hero__eyebrow">Photo management</p>
        <h1 className="manage-hero__title">Upload, reorder, and edit your photos.</h1>
      </header>

      {!authLoading && !canManage && (
        <p className="manage-status manage-status--error">This page is only available for your own main profile.</p>
      )}

      {authLoading && <p className="manage-empty">Checking your session...</p>}

      {!authLoading && canManage && (
        isQueueOpen ? (
          <PhotoUploadSection
            drafts={drafts}
            onDraftsChange={setDrafts}
            disabled={saving}
            error={error}
            success={success}
            onSave={onSave}
          />
        ) : (
          <PhotoOrderSection
            profileSlug={profileSlug}
            photos={photos}
            loading={orderLoading}
            saving={orderSaving}
            error={orderError}
            success={orderSuccess}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
            onOpenPhoto={(photoId) => openPhoto(photoId, "modal")}
            onSave={saveOrder}
          />
        )
      )}
    </div>
  );
}
