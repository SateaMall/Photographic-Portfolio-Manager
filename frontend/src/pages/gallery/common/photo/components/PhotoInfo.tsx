import type { FormEvent } from "react";

import type { MainPhotoResponse, PublicProfileResponse } from "../../../../../types/types";
import "./PhotoInfo.css";

type PhotoEditDraft = {
  title: string;
  description: string;
  country: string;
  city: string;
  captureYear: string;
};

type Props = {
  mainPhoto: MainPhotoResponse | null;
  mainProfile: PublicProfileResponse | null;
  canManage?: boolean;
  isEditing?: boolean;
  editDraft?: PhotoEditDraft | null;
  isSubmitting?: boolean;
  actionError?: string | null;
  actionSuccess?: string | null;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onChangeField?: (field: keyof PhotoEditDraft, value: string) => void;
};

export default function PhotoInfo({
  mainPhoto,
  mainProfile,
  canManage = false,
  isEditing = false,
  editDraft = null,
  isSubmitting = false,
  actionError = null,
  actionSuccess = null,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onChangeField,
}: Props) {
  const title = mainPhoto?.title?.trim() || "Untitled";
  const description = mainPhoto?.description?.trim?.() || mainPhoto?.description;
  const owner = mainProfile?.displayName;
  const themes = mainPhoto?.themes ?? [];
  const location = [mainPhoto?.city, mainPhoto?.country].filter(Boolean).join(", ");
  const captureYear = mainPhoto?.captureYear;
  const metaItems = [location || null, captureYear ? String(captureYear) : null, owner || null].filter(Boolean);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave?.();
  }

  return (
    <div aria-label="Photo details">
      <div className="photo-page__subline">
        <h1 className="photo-page__title">{title}</h1>
        {metaItems.map((item, index) => (
          <span key={`${item}-${index}`} className="photo-page__meta-item">
            <span className="meta-sep">•</span>
            <span className="meta-pill">{item}</span>
          </span>
        ))}
      </div>

      {(actionError || actionSuccess) && (
        <div className="photo-page__messages">
          {actionError && <p className="photo-page__status photo-page__status--error">{actionError}</p>}
          {actionSuccess && <p className="photo-page__status photo-page__status--success">{actionSuccess}</p>}
        </div>
      )}

      {canManage && !isEditing && (
        <div className="photo-page__admin-actions">
          <button type="button" className="photo-page__action-btn" onClick={onStartEdit}>
            Edit photo
          </button>
          <button
            type="button"
            className="photo-page__action-btn photo-page__action-btn--danger"
            onClick={onDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Working..." : "Delete photo"}
          </button>
        </div>
      )}

      {isEditing && editDraft ? (
        <form className="photo-page__form" onSubmit={onSubmit}>
          <label className="photo-page__field">
            <span>Title</span>
            <input
              value={editDraft.title}
              onChange={(event) => onChangeField?.("title", event.target.value)}
              disabled={isSubmitting}
            />
          </label>

          <label className="photo-page__field">
            <span>Description</span>
            <textarea
              value={editDraft.description}
              onChange={(event) => onChangeField?.("description", event.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
          </label>

          <div className="photo-page__field-row">
            <label className="photo-page__field">
              <span>Country</span>
              <input
                value={editDraft.country}
                onChange={(event) => onChangeField?.("country", event.target.value)}
                placeholder="FR"
                disabled={isSubmitting}
              />
            </label>

            <label className="photo-page__field">
              <span>City</span>
              <input
                value={editDraft.city}
                onChange={(event) => onChangeField?.("city", event.target.value)}
                placeholder="Paris"
                disabled={isSubmitting}
              />
            </label>

            <label className="photo-page__field">
              <span>Capture year</span>
              <input
                value={editDraft.captureYear}
                onChange={(event) => onChangeField?.("captureYear", event.target.value)}
                inputMode="numeric"
                placeholder="2026"
                disabled={isSubmitting}
              />
            </label>
          </div>

          <div className="photo-page__form-actions">
            <button type="submit" className="photo-page__action-btn" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              className="photo-page__action-btn photo-page__action-btn--ghost"
              onClick={onCancelEdit}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="photo-page__action-btn photo-page__action-btn--danger"
              onClick={onDelete}
              disabled={isSubmitting}
            >
              Delete photo
            </button>
          </div>
        </form>
      ) : (
        <details className="meta-details">
          <summary className="meta-summary">More details</summary>
          <p className="photo-page__desc">{description}</p>
          <dl className="photo-page__dl">
            <div className="photo-page__row">
              <dt className="meta-headlines">Themes</dt>
              <dd>
                {Array.isArray(themes) && themes.length > 0 ? (
                  <div className="photo-page__chips">
                    {themes.map((theme: string) => (
                      <span key={theme} className="photo-page__chip">
                        {theme}
                      </span>
                    ))}
                  </div>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>
        </details>
      )}
    </div>
  );
}
