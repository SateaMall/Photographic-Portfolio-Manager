import { photoFileUrl } from "../../../../../../api/photos";
import type { ManagedPhotoResponse } from "../../../../../../types/types";
import { formatDate, formatPhotoMeta, formatPhotoTitle } from "../utils/manageFormatting";

type PhotoLibraryCardProps = {
  profileSlug: string;
  photo: ManagedPhotoResponse;
  disabled: boolean;
  onAction: () => void;
  actionLabel: string;
  actionVariant?: "ghost" | "secondary";
  isSelected?: boolean;
  showDate?: boolean;
};

export function PhotoLibraryCard({
  profileSlug,
  photo,
  disabled,
  onAction,
  actionLabel,
  actionVariant = "ghost",
  isSelected = false,
  showDate = false,
}: PhotoLibraryCardProps) {
  return (
    <article className={`manage-library-card ${isSelected ? "is-selected" : ""}`}>
      <img
        className="manage-library-card__image"
        src={photoFileUrl(photo.id, profileSlug, "THUMB")}
        alt={photo.title ?? ""}
        loading="lazy"
      />

      <div>
        <h3 className="manage-library-card__title">{formatPhotoTitle(photo)}</h3>
        <p className="manage-library-card__meta">{formatPhotoMeta(photo)}</p>
        {showDate && <p className="manage-library-card__date">Uploaded {formatDate(photo.createdAt)}</p>}
      </div>

      <button
        type="button"
        className={`manage-button ${actionVariant === "secondary" ? "manage-button--secondary" : "manage-button--ghost"}`}
        onClick={onAction}
        disabled={disabled}
      >
        {actionLabel}
      </button>
    </article>
  );
}
