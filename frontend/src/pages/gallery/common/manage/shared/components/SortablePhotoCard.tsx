import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BsGripVertical } from "react-icons/bs";

import { photoFileUrl } from "../../../../../../api/photos";
import type { ManagedPhotoResponse } from "../../../../../../types/types";
import { formatPhotoMeta, formatPhotoTitle } from "../utils/manageFormatting";

type SortablePhotoCardProps = {
  profileSlug: string;
  photo: ManagedPhotoResponse;
  disabled: boolean;
  onAction: () => void;
  actionLabel?: string;
  onPreviewClick?: () => void;
};

export function SortablePhotoCard({ profileSlug, photo, disabled, onAction, actionLabel = "Remove", onPreviewClick }: SortablePhotoCardProps) {
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
      {onPreviewClick ? (
        <button
          type="button"
          className="manage-sortable-card__preview"
          onClick={onPreviewClick}
          aria-label={`Open ${formatPhotoTitle(photo)}`}
          disabled={disabled}
        >
          <img
            className="manage-sortable-card__image"
            src={photoFileUrl(photo.id, profileSlug, "THUMB")}
            alt={photo.title ?? ""}
            loading="lazy"
          />
        </button>
      ) : (
        <img
          className="manage-sortable-card__image"
          src={photoFileUrl(photo.id, profileSlug, "THUMB")}
          alt={photo.title ?? ""}
          loading="lazy"
        />
      )}

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
            onClick={onAction}
            disabled={disabled}
          >
            {actionLabel}
          </button>
        </div>

        <div>
          <h3 className="manage-sortable-card__title">{formatPhotoTitle(photo)}</h3>
          <p className="manage-sortable-card__meta">{formatPhotoMeta(photo)}</p>
        </div>
      </div>
    </article>
  );
}
