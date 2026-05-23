import { useCallback, useEffect, useMemo, useState } from "react";
import { closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import {
  deleteManagedPhotoFeature,
  fetchAllManageablePhotos,
  fetchManageableHeroPhotos,
  setManagedPhotoFeature,
} from "../../../../../../../api/manage";
import type { ManagedPhotoResponse } from "../../../../../../../types/types";
import { readErrorMessage } from "../../../shared/utils/manageErrors";

const HERO_FEATURE_TYPE = "HOMEPAGE_HERO";

function getHeroOrderKey(photos: ManagedPhotoResponse[]) {
  return photos.map((photo) => photo.id).join(",");
}

type UseCarouselWorkspaceProps = {
  profileSlug: string;
  canManage: boolean;
  authLoading: boolean;
};

export function useCarouselWorkspace({ profileSlug, canManage, authLoading }: UseCarouselWorkspaceProps) {
  const [allPhotos, setAllPhotos] = useState<ManagedPhotoResponse[]>([]);
  const [selectedHeroPhotos, setSelectedHeroPhotos] = useState<ManagedPhotoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saveRevision, setSaveRevision] = useState(0);
  const [lastProcessedRevision, setLastProcessedRevision] = useState(0);
  const [savedHeroOrderKey, setSavedHeroOrderKey] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    let cancelled = false;

    if (authLoading || !canManage || !profileSlug) {
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);

    Promise.all([fetchAllManageablePhotos(profileSlug), fetchManageableHeroPhotos(profileSlug)])
      .then(([nextPhotos, nextHeroPhotos]) => {
        if (!cancelled) {
          const nextHeroOrderKey = getHeroOrderKey(nextHeroPhotos);
          setAllPhotos(nextPhotos);
          setSelectedHeroPhotos(nextHeroPhotos);
          setSavedHeroOrderKey(nextHeroOrderKey);
          setSaveRevision(0);
          setLastProcessedRevision(0);
          setError(null);
          setSuccess(null);
        }
      })
      .catch((caughtError) => {
        if (!cancelled) {
          setError(readErrorMessage(caughtError, "Unable to load carousel settings."));
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
  }, [authLoading, canManage, profileSlug]);

  const selectedHeroIds = selectedHeroPhotos.map((photo) => photo.id);
  const selectedHeroIdsSet = useMemo(() => new Set(selectedHeroIds), [selectedHeroIds]);
  const photoLibrary = allPhotos.filter((photo) => !selectedHeroIdsSet.has(photo.id));
  const hasUnsavedChanges = getHeroOrderKey(selectedHeroPhotos) !== savedHeroOrderKey;

  function toggleHeroPhoto(photo: ManagedPhotoResponse) {
    setSelectedHeroPhotos((currentPhotos) => {
      if (currentPhotos.some((currentPhoto) => currentPhoto.id === photo.id)) {
        return currentPhotos.filter((currentPhoto) => currentPhoto.id !== photo.id);
      }

      return [...currentPhotos, photo];
    });
    setSaveRevision((currentRevision) => currentRevision + 1);
    setError(null);
    setSuccess(null);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setSelectedHeroPhotos((currentPhotos) => {
      const oldIndex = currentPhotos.findIndex((photo) => photo.id === String(active.id));
      const newIndex = currentPhotos.findIndex((photo) => photo.id === String(over.id));

      if (oldIndex === -1 || newIndex === -1) {
        return currentPhotos;
      }

      return arrayMove(currentPhotos, oldIndex, newIndex);
    });
    setSaveRevision((currentRevision) => currentRevision + 1);
    setError(null);
    setSuccess(null);
  }

  const persistCarousel = useCallback(async (nextHeroPhotos: ManagedPhotoResponse[]) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const failures: string[] = [];

    try {
      const currentHeroPhotos = await fetchManageableHeroPhotos(profileSlug);
      const currentHeroIds = new Set(currentHeroPhotos.map((photo) => photo.id));
      const nextHeroIds = new Set(nextHeroPhotos.map((photo) => photo.id));

      for (const photo of currentHeroPhotos) {
        if (!nextHeroIds.has(photo.id)) {
          try {
            await deleteManagedPhotoFeature(photo.id, { slug: profileSlug, type: HERO_FEATURE_TYPE });
          } catch (caughtError) {
            failures.push(readErrorMessage(caughtError, `Failed to remove ${photo.title?.trim() || "a photo"} from the carousel.`));
          }
        }
      }

      for (const [index, photo] of nextHeroPhotos.entries()) {
        try {
          await setManagedPhotoFeature(photo.id, {
            slug: profileSlug,
            type: HERO_FEATURE_TYPE,
            index,
            enabled: true,
          });
        } catch (caughtError) {
          failures.push(readErrorMessage(caughtError, `Failed to save ${photo.title?.trim() || "a photo"} in the carousel.`));
        }
      }

      const refreshedHeroPhotos = await fetchManageableHeroPhotos(profileSlug);
      const refreshedHeroOrderKey = getHeroOrderKey(refreshedHeroPhotos);
      setSelectedHeroPhotos(refreshedHeroPhotos);
      setSavedHeroOrderKey(refreshedHeroOrderKey);

      if (failures.length > 0) {
        setError(failures.join(" "));
      }

      if (nextHeroPhotos.length === 0 && currentHeroIds.size > 0 && failures.length === 0) {
        setSuccess("Carousel cleared. The profile page will fall back to the first photos in your grid.");
      } else if (failures.length === 0) {
        setSuccess("Carousel changes saved automatically.");
      } else {
        setSuccess("Partial carousel autosave completed.");
      }
    } catch (caughtError) {
      setError(readErrorMessage(caughtError, "Failed to save carousel changes automatically."));
    } finally {
      setSaving(false);
    }
  }, [profileSlug]);

  useEffect(() => {
    if (loading || authLoading || !canManage || !profileSlug || saving || saveRevision === 0 || saveRevision <= lastProcessedRevision) {
      return;
    }

    setLastProcessedRevision(saveRevision);
    void persistCarousel(selectedHeroPhotos);
  }, [authLoading, canManage, lastProcessedRevision, loading, persistCarousel, profileSlug, saveRevision, saving, selectedHeroPhotos]);

  function retrySave() {
    if (!hasUnsavedChanges || saving) {
      return;
    }

    void persistCarousel(selectedHeroPhotos);
  }

  return {
    error,
    hasUnsavedChanges,
    loading,
    onDragEnd,
    photoLibrary,
    retrySave,
    saving,
    selectedHeroIds,
    selectedHeroPhotos,
    sensors,
    success,
    toggleHeroPhoto,
  };
}

export { closestCenter };
