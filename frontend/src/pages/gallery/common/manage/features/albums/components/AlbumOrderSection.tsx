import { DndContext, useSensors, type CollisionDetection, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";

import type { ManagedPhotoResponse } from "../../../../../../../types/types";
import { SortablePhotoCard } from "../../../shared/components/SortablePhotoCard";

type AlbumOrderSectionProps = {
  profileSlug: string;
  orderedPhotoIds: string[];
  orderedPhotos: ManagedPhotoResponse[];
  disabled: boolean;
  saving: boolean;
  sensors: ReturnType<typeof useSensors>;
  onDragEnd: (event: DragEndEvent) => void;
  onRemove: (photoId: string) => void;
  onSave: () => void;
  collisionDetection: CollisionDetection;
};

export function AlbumOrderSection({
  profileSlug,
  orderedPhotoIds,
  orderedPhotos,
  disabled,
  saving,
  sensors,
  onDragEnd,
  onRemove,
  onSave,
  collisionDetection,
}: AlbumOrderSectionProps) {
  return (
    <section className="manage-section">
      <div className="manage-section__header">
        <div>
          <h2 className="manage-section__title">Collection order</h2>
          <p className="manage-section__copy">Drag photos to reorder them. New uploads are appended after the ordered photos when you save.</p>
        </div>
        <p className="manage-hero__meta">{orderedPhotoIds.length} in collection</p>
      </div>

      {orderedPhotos.length === 0 ? (
        <div className="manage-card">
          <p className="manage-empty">This collection is empty. Add photos from your library or upload new ones.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={collisionDetection} onDragEnd={onDragEnd}>
          <SortableContext items={orderedPhotoIds} strategy={rectSortingStrategy}>
            <div className="manage-sortable-grid">
              {orderedPhotos.map((photo) => (
                <SortablePhotoCard
                  key={photo.id}
                  profileSlug={profileSlug}
                  photo={photo}
                  disabled={disabled}
                  onAction={() => onRemove(photo.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="manage-actions manage-actions--section">
        <div className="manage-actions__group">
          <button type="button" className="manage-button manage-button--primary" onClick={onSave} disabled={disabled}>
            {saving ? "Saving..." : "Save album"}
          </button>
        </div>
      </div>
    </section>
  );
}
