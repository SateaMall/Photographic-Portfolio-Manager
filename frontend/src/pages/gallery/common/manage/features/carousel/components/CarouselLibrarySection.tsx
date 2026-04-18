import type { ManagedPhotoResponse } from "../../../../../../../types/types";
import { PhotoLibraryCard } from "../../../shared/components/PhotoLibraryCard";

type CarouselLibrarySectionProps = {
  profileSlug: string;
  photos: ManagedPhotoResponse[];
  saving: boolean;
  onAdd: (photo: ManagedPhotoResponse) => void;
};

export function CarouselLibrarySection({ profileSlug, photos, saving, onAdd }: CarouselLibrarySectionProps) {
  return (
    <section className="manage-section">
      <div className="manage-section__header">
        <div>
          <h2 className="manage-section__title">Photo library</h2>
          <p className="manage-section__copy">Add any profile photo into the hero carousel. Its order will match the sequence above.</p>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="manage-card">
          <p className="manage-empty">Every available photo is already in the carousel.</p>
        </div>
      ) : (
        <div className="manage-library-grid">
          {photos.map((photo) => (
            <PhotoLibraryCard
              key={photo.id}
              profileSlug={profileSlug}
              photo={photo}
              disabled={saving}
              onAction={() => onAdd(photo)}
              actionLabel="Add to carousel"
            />
          ))}
        </div>
      )}
    </section>
  );
}
