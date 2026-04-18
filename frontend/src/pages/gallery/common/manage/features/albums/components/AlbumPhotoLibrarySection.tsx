import type { ManagedPhotoResponse } from "../../../../../../../types/types";
import { PhotoLibraryCard } from "../../../shared/components/PhotoLibraryCard";

type AlbumPhotoLibrarySectionProps = {
  profileSlug: string;
  allPhotos: ManagedPhotoResponse[];
  libraryPhotoIds: Set<string>;
  disabled: boolean;
  onToggle: (photoId: string) => void;
};

export function AlbumPhotoLibrarySection({ profileSlug, allPhotos, libraryPhotoIds, disabled, onToggle }: AlbumPhotoLibrarySectionProps) {
  return (
    <section className="manage-section">
      <div className="manage-section__header">
        <div>
          <h2 className="manage-section__title">Photo library</h2>
          <p className="manage-section__copy">Add existing profile photos to the album or remove them from the final order.</p>
        </div>
      </div>

      {allPhotos.length === 0 ? (
        <div className="manage-card">
          <p className="manage-empty">This profile does not have any photos yet.</p>
        </div>
      ) : (
        <div className="manage-library-grid">
          {allPhotos.map((photo) => {
            const isSelected = libraryPhotoIds.has(photo.id);

            return (
              <PhotoLibraryCard
                key={photo.id}
                profileSlug={profileSlug}
                photo={photo}
                disabled={disabled}
                onAction={() => onToggle(photo.id)}
                actionLabel={isSelected ? "In album" : "Add to album"}
                actionVariant={isSelected ? "secondary" : "ghost"}
                isSelected={isSelected}
                showDate
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
