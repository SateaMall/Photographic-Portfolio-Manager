import { useCallback, useEffect, useState } from "react";
import { KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { fetchManageableGridPhotos, reorderManagedGridPhotos } from "../../../../../../../api/manage";
import type { ManagedPhotoResponse } from "../../../../../../../types/types";
import { PHOTO_MANAGED_EVENT, type PhotoManagedDetail } from "../../../../photo/components/photoEvents";
import { readErrorMessage } from "../../../shared/utils/manageErrors";

type UseManagePhotoGridProps = {
  profileSlug: string;
  canManage: boolean;
  authLoading: boolean;
};

export function useManagePhotoGrid({ profileSlug, canManage, authLoading }: UseManagePhotoGridProps) {
  const [photos, setPhotos] = useState<ManagedPhotoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasPendingSave, setHasPendingSave] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const refreshPhotos = useCallback(async () => {
    const orderedPhotos = await fetchManageableGridPhotos(profileSlug);
    setPhotos(orderedPhotos);
    setHasPendingSave(false);
    return orderedPhotos;
  }, [profileSlug]);

  const persistOrder = useCallback(async (nextPhotos: ManagedPhotoResponse[]) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await reorderManagedGridPhotos(profileSlug, nextPhotos.map((photo) => photo.id));
      const refreshedPhotos = await refreshPhotos();
      setSuccess(`Homepage order saved automatically for ${refreshedPhotos.length} photo${refreshedPhotos.length === 1 ? "" : "s"}.`);
      setHasPendingSave(false);
    } catch (caughtError) {
      setError(readErrorMessage(caughtError, "Failed to save your homepage photo order automatically."));
      setHasPendingSave(true);
    } finally {
      setSaving(false);
    }
  }, [profileSlug, refreshPhotos]);

  useEffect(() => {
    let cancelled = false;

    if (authLoading || !canManage || !profileSlug) {
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);

    refreshPhotos()
      .then(() => {
        if (!cancelled) {
          setError(null);
        }
      })
      .catch((caughtError) => {
        if (!cancelled) {
          setError(readErrorMessage(caughtError, "Unable to load your homepage photo order."));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, canManage, profileSlug, refreshPhotos]);

  useEffect(() => {
    function onPhotoManaged(event: Event) {
      const detail = (event as CustomEvent<PhotoManagedDetail>).detail;

      if (detail.type === "updated") {
        setPhotos((currentPhotos) => currentPhotos.map((photo) => (
          photo.id === detail.photo.id
            ? {
                ...photo,
                createdAt: detail.photo.createdAt,
                title: detail.photo.title,
                description: detail.photo.description,
                country: detail.photo.country,
                city: detail.photo.city,
                captureYear: detail.photo.captureYear,
              }
            : photo
        )));
        return;
      }

      setPhotos((currentPhotos) => currentPhotos.filter((photo) => photo.id !== detail.photoId));
      setHasPendingSave(false);
    }

    window.addEventListener(PHOTO_MANAGED_EVENT, onPhotoManaged as EventListener);

    return () => {
      window.removeEventListener(PHOTO_MANAGED_EVENT, onPhotoManaged as EventListener);
    };
  }, []);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (saving || !over || active.id === over.id) {
      return;
    }

    const oldIndex = photos.findIndex((photo) => photo.id === String(active.id));
    const newIndex = photos.findIndex((photo) => photo.id === String(over.id));

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const nextPhotos = arrayMove(photos, oldIndex, newIndex);
    setPhotos(nextPhotos);
    setHasPendingSave(true);
    setError(null);
    setSuccess(null);
    void persistOrder(nextPhotos);
  }

  function retrySave() {
    if (saving || !hasPendingSave) {
      return;
    }

    void persistOrder(photos);
  }

  return {
    error,
    hasPendingSave,
    loading,
    onDragEnd,
    photos,
    refreshPhotos,
    retrySave,
    saving,
    sensors,
    success,
  };
}
