import { useMemo, useState } from "react";
import { KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import {
  addPhotoToManagedAlbum,
  removePhotoFromManagedAlbum,
  reorderManagedAlbumPhotos,
  updateManagedAlbum,
} from "../../../../../../../api/manage";
import type { AlbumViewResponse, ManagedAlbumResponse, ManagedPhotoResponse } from "../../../../../../../types/types";
import { readErrorMessage } from "../../../shared/utils/manageErrors";

function getPhotoOrderKey(photoIds: string[]) {
  return photoIds.join(",");
}

type UseAlbumEditorProps = {
  album: ManagedAlbumResponse;
  allPhotos: ManagedPhotoResponse[];
  onRefreshAlbums: () => Promise<AlbumViewResponse[]>;
  onRefreshAlbum: (albumId: string) => Promise<ManagedAlbumResponse>;
  onDeleteAlbum: (albumId: string) => Promise<void>;
};

export function useAlbumEditor({ album, allPhotos, onRefreshAlbums, onRefreshAlbum, onDeleteAlbum }: UseAlbumEditorProps) {
  const [title, setTitle] = useState(album.title);
  const [description, setDescription] = useState(album.description ?? "");
  const [orderedPhotoIds, setOrderedPhotoIds] = useState<string[]>(album.photos.map((photo) => photo.id));
  const [savedPhotoIds, setSavedPhotoIds] = useState<string[]>(album.photos.map((photo) => photo.id));
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingPhotos, setSavingPhotos] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const hasPendingPhotoChanges = getPhotoOrderKey(orderedPhotoIds) !== getPhotoOrderKey(savedPhotoIds);

  async function persistPhotoChanges(nextPhotoIds: string[]) {
    setSavingPhotos(true);
    setError(null);
    setSuccess(null);

    const failures: string[] = [];
    const savedPhotoIdSet = new Set(savedPhotoIds);
    const nextPhotoIdSet = new Set(nextPhotoIds);
    const toRemove = savedPhotoIds.filter((photoId) => !nextPhotoIdSet.has(photoId));
    const toAdd = nextPhotoIds.filter((photoId) => !savedPhotoIdSet.has(photoId));

    for (const photoId of toRemove) {
      try {
        await removePhotoFromManagedAlbum(album.albumId, photoId);
      } catch (caughtError) {
        failures.push(readErrorMessage(caughtError, `Failed to remove photo ${photoId} from the collection.`));
      }
    }

    for (const photoId of toAdd) {
      try {
        await addPhotoToManagedAlbum(album.albumId, photoId);
      } catch (caughtError) {
        failures.push(readErrorMessage(caughtError, `Failed to add photo ${photoId} to the collection.`));
      }
    }

    try {
      await reorderManagedAlbumPhotos(album.albumId, nextPhotoIds);
    } catch (caughtError) {
      failures.push(readErrorMessage(caughtError, "Failed to save the collection photo order automatically."));
    }

    try {
      await onRefreshAlbums();
      const refreshedAlbum = await onRefreshAlbum(album.albumId);
      const refreshedPhotoIds = refreshedAlbum.photos.map((photo) => photo.id);

      setSavedPhotoIds(refreshedPhotoIds);
      if (failures.length === 0) {
        setOrderedPhotoIds(refreshedPhotoIds);
      }
    } catch (caughtError) {
      failures.push(readErrorMessage(caughtError, "Saved some collection changes, but the workspace could not refresh."));
    }

    if (failures.length > 0) {
      setError(failures.join(" "));
      setSuccess("Partial collection autosave completed.");
    } else {
      setSuccess(`Collection changes saved automatically. ${nextPhotoIds.length} photo${nextPhotoIds.length === 1 ? "" : "s"} currently in the collection.`);
    }

    setSavingPhotos(false);
  }

  function togglePhoto(photoId: string) {
    if (savingPhotos || deleting) {
      return;
    }

    const nextPhotoIds = orderedPhotoIds.includes(photoId)
      ? orderedPhotoIds.filter((currentId) => currentId !== photoId)
      : [...orderedPhotoIds, photoId];

    setOrderedPhotoIds(nextPhotoIds);
    setError(null);
    setSuccess(null);
    void persistPhotoChanges(nextPhotoIds);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (savingPhotos || deleting || !over || active.id === over.id) {
      return;
    }

    const oldIndex = orderedPhotoIds.indexOf(String(active.id));
    const newIndex = orderedPhotoIds.indexOf(String(over.id));

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const nextPhotoIds = arrayMove(orderedPhotoIds, oldIndex, newIndex);
    setOrderedPhotoIds(nextPhotoIds);
    setError(null);
    setSuccess(null);
    void persistPhotoChanges(nextPhotoIds);
  }

  async function onSaveDetails() {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      setError("Album title is required.");
      return;
    }

    setSavingDetails(true);
    setError(null);
    setSuccess(null);

    try {
      await updateManagedAlbum(album.albumId, { title: normalizedTitle, description });
      await onRefreshAlbums();
      const refreshedAlbum = await onRefreshAlbum(album.albumId);
      setTitle(refreshedAlbum.title);
      setDescription(refreshedAlbum.description ?? "");
      const refreshedPhotoIds = refreshedAlbum.photos.map((photo) => photo.id);
      setSavedPhotoIds(refreshedPhotoIds);
      if (!hasPendingPhotoChanges) {
        setOrderedPhotoIds(refreshedPhotoIds);
      }
      setSuccess("Collection details saved.");
    } catch (caughtError) {
      setError(readErrorMessage(caughtError, "Failed to save the collection details."));
    }

    setSavingDetails(false);
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
    error,
    hasPendingPhotoChanges,
    isBusy: savingDetails || savingPhotos || deleting,
    isPhotoBusy: savingPhotos || deleting,
    libraryPhotoIds: new Set(orderedPhotoIds),
    onDelete,
    onDragEnd,
    onSaveDetails,
    orderedPhotoIds,
    orderedPhotos,
    retryPhotoSave: () => {
      if (!savingPhotos && !deleting && hasPendingPhotoChanges) {
        void persistPhotoChanges(orderedPhotoIds);
      }
    },
    savingDetails,
    savingPhotos,
    sensors,
    setDescription,
    setTitle,
    success,
    title,
    togglePhoto,
  };
}
