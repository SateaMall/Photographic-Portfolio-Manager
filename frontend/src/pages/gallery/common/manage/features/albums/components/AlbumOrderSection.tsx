import { DndContext, useSensors, type CollisionDetection, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";

import type { ManagedPhotoResponse } from "../../../../../../../types/types";
import { SortablePhotoCard } from "../../../shared/components/SortablePhotoCard";

type AlbumOrderSectionProps = {
  profileSlug: string;
  orderedPhotoIds: string[];
  orderedPhotos: ManagedPhotoResponse[];
  disabled: boolean;
  sensors: ReturnType<typeof useSensors>;
  onDragEnd: (event: DragEndEvent) => void;
  onRemove: (photoId: string) => void;
  collisionDetection: CollisionDetection;
};

export function AlbumOrderSection({
  profileSlug,
  orderedPhotoIds,
  orderedPhotos,
  disabled,
  sensors,
  onDragEnd,
  onRemove,
  collisionDetection,
}: AlbumOrderSectionProps) {
  return (
    <section className="manage-section">
      <div className="manage-section__header">
        <div>
          <h2 className="manage-section__title">Collection order</h2>
          <p className="manage-section__copy">Drag photos to reorder them.</p>
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
    </section>
  );
}
