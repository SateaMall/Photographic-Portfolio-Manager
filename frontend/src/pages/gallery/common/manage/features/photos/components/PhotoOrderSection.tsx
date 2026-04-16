import { DndContext, type CollisionDetection, type DragEndEvent, useSensors } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";

import type { ManagedPhotoResponse } from "../../../../../../../types/types";
import { SortablePhotoCard } from "../../../shared/components/SortablePhotoCard";

type PhotoOrderSectionProps = {
  profileSlug: string;
  photos: ManagedPhotoResponse[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  sensors: ReturnType<typeof useSensors>;
  collisionDetection: CollisionDetection;
  onDragEnd: (event: DragEndEvent) => void;
  onOpenPhoto: (photoId: string) => void;
  onSave: () => void;
};

export function PhotoOrderSection({
  profileSlug,
  photos,
  loading,
  saving,
  error,
  success,
  sensors,
  collisionDetection,
  onDragEnd,
  onOpenPhoto,
  onSave,
}: PhotoOrderSectionProps) {
  return (
    <section className="manage-section">
      <div className="manage-section__header">
        <div>
          <h2 className="manage-section__title">Homepage photo order</h2>
          <p className="manage-section__copy">Drag to reorder your main photo grid. Click any photo to open its popup and edit the details.</p>
        </div>
        <p className="manage-hero__meta">{photos.length} photos</p>
      </div>

      {loading ? (
        <div className="manage-card">
          <p className="manage-empty">Loading photo order...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="manage-card">
          <p className="manage-empty">No photos yet. Use New photo to start uploading.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={collisionDetection} onDragEnd={onDragEnd}>
          <SortableContext items={photos.map((photo) => photo.id)} strategy={rectSortingStrategy}>
            <div className="manage-sortable-grid">
              {photos.map((photo) => (
                <SortablePhotoCard
                  key={photo.id}
                  profileSlug={profileSlug}
                  photo={photo}
                  disabled={saving}
                  onAction={() => onOpenPhoto(photo.id)}
                  actionLabel="Edit"
                  onPreviewClick={() => onOpenPhoto(photo.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {error && <p className="manage-status manage-status--error">{error}</p>}
      {success && <p className="manage-status manage-status--success">{success}</p>}

      <div className="manage-actions manage-actions--section">
        <div className="manage-actions__group">
          <button type="button" className="manage-button manage-button--primary" onClick={onSave} disabled={saving || loading || photos.length === 0}>
            {saving ? "Saving..." : "Save photo order"}
          </button>
        </div>
      </div>
    </section>
  );
}
