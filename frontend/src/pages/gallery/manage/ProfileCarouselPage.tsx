import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BsGripVertical } from "react-icons/bs";

import {
  deleteManagedPhotoFeature,
  fetchAllManageablePhotos,
  fetchManageableHeroPhotos,
  setManagedPhotoFeature,
} from "../../../api/manage";
import { photoFileUrl } from "../../../api/photos";
import { useAuth } from "../../../auth/AuthContext";
import type { ManagedPhotoResponse } from "../../../types/types";
import "./ManagePage.css";

const HERO_FEATURE_TYPE = "HOMEPAGE_HERO";

type SortableHeroPhotoCardProps = {
  profileSlug: string;
  photo: ManagedPhotoResponse;
  disabled: boolean;
  onRemove: () => void;
};

function normalizeSlug(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function readErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatPhotoMeta(photo: ManagedPhotoResponse) {
  const parts = [photo.city, photo.country, photo.captureYear ? String(photo.captureYear) : null].filter(Boolean);
  return parts.length > 0 ? parts.join(" • ") : "No metadata yet";
}

function SortableHeroPhotoCard({ profileSlug, photo, disabled, onRemove }: SortableHeroPhotoCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article ref={setNodeRef} style={style} className={`manage-sortable-card ${isDragging ? "is-dragging" : ""}`}>
      <img
        className="manage-sortable-card__image"
        src={photoFileUrl(photo.id, profileSlug, "THUMB")}
        alt={photo.title ?? ""}
        loading="lazy"
      />

      <div className="manage-sortable-card__body">
        <div className="manage-sortable-card__header">
          <button
            type="button"
            className="manage-sortable-card__handle"
            aria-label={`Reorder ${photo.title ?? "photo"}`}
            disabled={disabled}
            {...attributes}
            {...listeners}
          >
            <BsGripVertical />
          </button>

          <button
            type="button"
            className="manage-button manage-button--ghost manage-button--compact"
            onClick={onRemove}
            disabled={disabled}
          >
            Remove
          </button>
        </div>

        <div>
          <h3 className="manage-sortable-card__title">{photo.title?.trim() || "Untitled"}</h3>
          <p className="manage-sortable-card__meta">{formatPhotoMeta(photo)}</p>
        </div>
      </div>
    </article>
  );
}

export default function ProfileCarouselPage() {
  const { slug } = useParams();
  const profileSlug = normalizeSlug(slug);
  const { session, isAuthenticated, loading: authLoading } = useAuth();
  const [allPhotos, setAllPhotos] = useState<ManagedPhotoResponse[]>([]);
  const [selectedHeroPhotos, setSelectedHeroPhotos] = useState<ManagedPhotoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canManage = isAuthenticated && normalizeSlug(session.profileSlug) === profileSlug;

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

      <section className="manage-section">
        <div className="manage-section__header">
          <div>
            <h2 className="manage-section__title">Carousel order</h2>
            <p className="manage-section__copy">Drag and order photos to appear in your profile's carousel.</p>
          </div>
          <p className="manage-hero__meta">{selectedHeroPhotos.length} selected</p>
        </div>

        {selectedHeroPhotos.length === 0 ? (
          <div className="manage-card">
            <p className="manage-empty">No chosen photos yet. Add photos from the library below.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={selectedHeroIds} strategy={rectSortingStrategy}>
              <div className="manage-sortable-grid">
                {selectedHeroPhotos.map((photo) => (
                  <SortableHeroPhotoCard
                    key={photo.id}
                    profileSlug={profileSlug}
                    photo={photo}
                    disabled={saving}
                    onRemove={() => toggleHeroPhoto(photo)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <div className="manage-actions manage-actions--section">
          <div className="manage-actions__group">
            <button type="button" className="manage-button manage-button--primary" onClick={onSave} disabled={saving}>
              {saving ? "Saving..." : "Save carousel"}
            </button>
          </div>
        </div>
      </section>

      <section className="manage-section">
        <div className="manage-section__header">
          <div>
            <h2 className="manage-section__title">Photo library</h2>
            <p className="manage-section__copy">Add any profile photo into the hero carousel. Its order will match the sequence above.</p>
          </div>
        </div>

        {photoLibrary.length === 0 ? (
          <div className="manage-card">
            <p className="manage-empty">Every available photo is already in the carousel.</p>
          </div>
        ) : (
          <div className="manage-library-grid">
            {photoLibrary.map((photo) => (
              <article className="manage-library-card" key={photo.id}>
                <img
                  className="manage-library-card__image"
                  src={photoFileUrl(photo.id, profileSlug, "THUMB")}
                  alt={photo.title ?? ""}
                  loading="lazy"
                />

                <div>
                  <h3 className="manage-library-card__title">{photo.title?.trim() || "Untitled"}</h3>
                  <p className="manage-library-card__meta">{formatPhotoMeta(photo)}</p>
                </div>

                <button
                  type="button"
                  className="manage-button manage-button--ghost"
                  onClick={() => toggleHeroPhoto(photo)}
                  disabled={saving}
                >
                  Add to carousel
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {error && <p className="manage-status manage-status--error">{error}</p>}
      {success && <p className="manage-status manage-status--success">{success}</p>}

      <div className="manage-actions">
        <div className="manage-actions__group">
          <button type="button" className="manage-button manage-button--primary" onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save carousel"}
          </button>
        </div>

        <div className="manage-actions__group">
          <Link className="manage-button manage-button--ghost" to={`/${profileSlug}`}>
            View profile
          </Link>
        </div>
      </div>
    </div>
  );
}
