import { useEffect, useMemo, useState } from "react";
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
          setAllPhotos(nextPhotos);
          setSelectedHeroPhotos(nextHeroPhotos);
          setError(null);
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

  function toggleHeroPhoto(photo: ManagedPhotoResponse) {
    setSelectedHeroPhotos((currentPhotos) => {
      if (currentPhotos.some((currentPhoto) => currentPhoto.id === photo.id)) {
        return currentPhotos.filter((currentPhoto) => currentPhoto.id !== photo.id);
      }

      return [...currentPhotos, photo];
    });
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
    setError(null);
    setSuccess(null);
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const failures: string[] = [];

    try {
      const currentHeroPhotos = await fetchManageableHeroPhotos(profileSlug);
      const currentHeroIds = new Set(currentHeroPhotos.map((photo) => photo.id));
      const nextHeroIds = new Set(selectedHeroPhotos.map((photo) => photo.id));

      for (const photo of currentHeroPhotos) {
        if (!nextHeroIds.has(photo.id)) {
          try {
            await deleteManagedPhotoFeature(photo.id, { slug: profileSlug, type: HERO_FEATURE_TYPE });
          } catch (caughtError) {
            failures.push(readErrorMessage(caughtError, `Failed to remove ${photo.title?.trim() || "a photo"} from the carousel.`));
          }
        }
      }

      for (const [index, photo] of selectedHeroPhotos.entries()) {
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
      setSelectedHeroPhotos(refreshedHeroPhotos);

      if (failures.length > 0) {
        setError(failures.join(" "));
      }

      if (selectedHeroPhotos.length === 0 && currentHeroIds.size > 0 && failures.length === 0) {
        setSuccess("Carousel cleared. The profile page will fall back to the first photos in your grid.");
      } else if (failures.length === 0) {
        setSuccess("Carousel settings saved.");
      } else {
        setSuccess("Partial carousel save completed.");
      }
    } catch (caughtError) {
      setError(readErrorMessage(caughtError, "Failed to save carousel settings."));
    } finally {
      setSaving(false);
    }
  }

  return {
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
  };
}

export { closestCenter };
