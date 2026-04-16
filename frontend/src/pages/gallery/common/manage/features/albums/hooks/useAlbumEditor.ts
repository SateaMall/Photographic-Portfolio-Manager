import { useMemo, useState } from "react";
import { KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import {
  addPhotoToManagedAlbum,
  removePhotoFromManagedAlbum,
  reorderManagedAlbumPhotos,
  updateManagedAlbum,
  uploadManagedPhoto,
} from "../../../../../../../api/manage";
import type { AlbumViewResponse, ManagedAlbumResponse, ManagedPhotoResponse } from "../../../../../../../types/types";
import { useUploadDraftQueue } from "../../../shared/hooks/useUploadDraftQueue";
import { readErrorMessage } from "../../../shared/utils/manageErrors";

type UseAlbumEditorProps = {
  album: ManagedAlbumResponse;
  allPhotos: ManagedPhotoResponse[];
  onRefreshAlbums: () => Promise<AlbumViewResponse[]>;
  onRefreshAlbum: (albumId: string) => Promise<ManagedAlbumResponse>;
  onRefreshPhotoLibrary: () => Promise<ManagedPhotoResponse[]>;
  onDeleteAlbum: (albumId: string) => Promise<void>;
};

export function useAlbumEditor({ album, allPhotos, onRefreshAlbums, onRefreshAlbum, onRefreshPhotoLibrary, onDeleteAlbum }: UseAlbumEditorProps) {
  const [title, setTitle] = useState(album.title);
  const [description, setDescription] = useState(album.description ?? "");
  const [orderedPhotoIds, setOrderedPhotoIds] = useState<string[]>(album.photos.map((photo) => photo.id));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { drafts, keepDraftsById, setDrafts } = useUploadDraftQueue();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const allPhotosById = useMemo(() => {
    const map = new Map<string, ManagedPhotoResponse>();
    allPhotos.forEach((photo) => {
      map.set(photo.id, photo);
    });
    album.photos.forEach((photo) => {
      if (!map.has(photo.id)) {
        map.set(photo.id, photo);
      }
    });
    return map;
  }, [album.photos, allPhotos]);

  const orderedPhotos = orderedPhotoIds
    .map((photoId) => allPhotosById.get(photoId))
    .filter((photo): photo is ManagedPhotoResponse => photo != null);

  function togglePhoto(photoId: string) {
    setOrderedPhotoIds((currentPhotoIds) => (
      currentPhotoIds.includes(photoId)
        ? currentPhotoIds.filter((currentId) => currentId !== photoId)
        : [...currentPhotoIds, photoId]
    ));
    setError(null);
    setSuccess(null);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setOrderedPhotoIds((currentPhotoIds) => {
      const oldIndex = currentPhotoIds.indexOf(String(active.id));
      const newIndex = currentPhotoIds.indexOf(String(over.id));

      if (oldIndex === -1 || newIndex === -1) {
        return currentPhotoIds;
      }

      return arrayMove(currentPhotoIds, oldIndex, newIndex);
    });
    setError(null);
    setSuccess(null);
  }

  async function onSave() {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      setError("Album title is required.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    const failures: string[] = [];
    const initialIds = album.photos.map((photo) => photo.id);
    const nextIds = orderedPhotoIds;
    const initialIdSet = new Set(initialIds);
    const nextIdSet = new Set(nextIds);
    const toRemove = initialIds.filter((photoId) => !nextIdSet.has(photoId));
    const toAdd = nextIds.filter((photoId) => !initialIdSet.has(photoId));
    const failedDraftIds = new Set<string>();
    const uploadedPhotoIds: string[] = [];

    try {
      await updateManagedAlbum(album.albumId, { title: normalizedTitle, description });
    } catch (caughtError) {
      failures.push(readErrorMessage(caughtError, "Failed to save the album details."));
    }

    for (const photoId of toRemove) {
      try {
        await removePhotoFromManagedAlbum(album.albumId, photoId);
      } catch (caughtError) {
        failures.push(readErrorMessage(caughtError, `Failed to remove photo ${photoId} from the album.`));
      }
    }

    for (const photoId of toAdd) {
      try {
        await addPhotoToManagedAlbum(album.albumId, photoId);
      } catch (caughtError) {
        failures.push(readErrorMessage(caughtError, `Failed to add photo ${photoId} to the album.`));
      }
    }

    for (const draft of drafts) {
      try {
        const uploadedPhoto = await uploadManagedPhoto(draft, album.albumId);
        uploadedPhotoIds.push(uploadedPhoto.id);
      } catch (caughtError) {
        failedDraftIds.add(draft.id);
        failures.push(readErrorMessage(caughtError, `Failed to upload ${draft.file.name}.`));
      }
    }

    const finalOrder = [...nextIds, ...uploadedPhotoIds];
    if (finalOrder.length > 0) {
      try {
        await reorderManagedAlbumPhotos(album.albumId, finalOrder);
      } catch (caughtError) {
        failures.push(readErrorMessage(caughtError, "Failed to save the album photo order."));
      }
    }

    keepDraftsById(failedDraftIds);

    try {
      await onRefreshAlbums();
      const refreshedAlbum = await onRefreshAlbum(album.albumId);
      setTitle(refreshedAlbum.title);
      setDescription(refreshedAlbum.description ?? "");
      setOrderedPhotoIds(refreshedAlbum.photos.map((photo) => photo.id));
      if (uploadedPhotoIds.length > 0) {
        await onRefreshPhotoLibrary();
      }
    } catch (caughtError) {
      failures.push(readErrorMessage(caughtError, "Saved some changes, but the workspace could not refresh."));
    }

    if (failures.length > 0) {
      setError(failures.join(" "));
    }

    if (failures.length === 0) {
      setSuccess(`Album saved. ${finalOrder.length} photo${finalOrder.length === 1 ? "" : "s"} currently in the album.`);
    } else if (finalOrder.length > 0 || uploadedPhotoIds.length > 0) {
      setSuccess("Partial save completed.");
    }

    setSaving(false);
  }

  async function onDelete() {
    if (!window.confirm(`Delete album "${album.title}" permanently?`)) {
      return;
    }

    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      await onDeleteAlbum(album.albumId);
    } catch (caughtError) {
      setError(readErrorMessage(caughtError, "Failed to delete this album."));
      setDeleting(false);
    }
  }

  return {
    deleting,
    description,
    drafts,
    error,
    isBusy: saving || deleting,
    libraryPhotoIds: new Set(orderedPhotoIds),
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
  };
}
