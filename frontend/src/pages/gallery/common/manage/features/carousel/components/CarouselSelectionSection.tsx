import { DndContext, useSensors, type CollisionDetection, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";

import type { ManagedPhotoResponse } from "../../../../../../../types/types";
import { SortablePhotoCard } from "../../../shared/components/SortablePhotoCard";

type CarouselSelectionSectionProps = {
  profileSlug: string;
  selectedHeroPhotos: ManagedPhotoResponse[];
  selectedHeroIds: string[];
  saving: boolean;
  sensors: ReturnType<typeof useSensors>;
  onDragEnd: (event: DragEndEvent) => void;
  onRemove: (photo: ManagedPhotoResponse) => void;
  onSave: () => void;
  collisionDetection: CollisionDetection;
};

export function CarouselSelectionSection({
  profileSlug,
  selectedHeroPhotos,
  selectedHeroIds,
  saving,
  sensors,
  onDragEnd,
  onRemove,
  onSave,
  collisionDetection,
}: CarouselSelectionSectionProps) {
  return (
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
        <DndContext sensors={sensors} collisionDetection={collisionDetection} onDragEnd={onDragEnd}>
          <SortableContext items={selectedHeroIds} strategy={rectSortingStrategy}>
            <div className="manage-sortable-grid">
              {selectedHeroPhotos.map((photo) => (
                <SortablePhotoCard
                  key={photo.id}
                  profileSlug={profileSlug}
                  photo={photo}
                  disabled={saving}
                  onAction={() => onRemove(photo)}
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
  );
}
