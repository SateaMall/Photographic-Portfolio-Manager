import { useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";

import type { UploadPhotoDraft } from "../../../../types/types";
import { createUploadPhotoDraft, isAcceptedUploadFile, revokeUploadDrafts } from "./photoUploadDrafts";
import "./PhotoUploadQueue.css";

function buildFileKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

type PhotoUploadQueueProps = {
  drafts: UploadPhotoDraft[];
  onDraftsChange: (drafts: UploadPhotoDraft[]) => void;
  disabled?: boolean;
};

export function PhotoUploadQueue({ drafts, onDraftsChange, disabled = false }: PhotoUploadQueueProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  function updateDraft(draftId: string, field: keyof Omit<UploadPhotoDraft, "id" | "file" | "previewUrl">, value: string) {
    onDraftsChange(
      drafts.map((draft) => (draft.id === draftId ? { ...draft, [field]: value } : draft)),
    );
  }

  function removeDraft(draftId: string) {
    const draft = drafts.find((item) => item.id === draftId);
    if (draft) {
      URL.revokeObjectURL(draft.previewUrl);
    }

    onDraftsChange(drafts.filter((item) => item.id !== draftId));
  }

  function clearDrafts() {
    revokeUploadDrafts(drafts);
    onDraftsChange([]);
  }

  function appendFiles(files: File[]) {
    if (files.length === 0) {
      return;
    }

    const existingKeys = new Set(drafts.map((draft) => buildFileKey(draft.file)));
    const rejectedNames: string[] = [];
    const nextDrafts: UploadPhotoDraft[] = [];

    files.forEach((file) => {
      const fileKey = buildFileKey(file);

      if (!isAcceptedUploadFile(file) || existingKeys.has(fileKey)) {
        rejectedNames.push(file.name);
        return;
      }

      existingKeys.add(fileKey);
      nextDrafts.push(createUploadPhotoDraft(file));
    });

    if (nextDrafts.length > 0) {
      onDraftsChange([...drafts, ...nextDrafts]);
      setLocalError(null);
    }

    if (rejectedNames.length > 0) {
      setLocalError(`Skipped unsupported or duplicate files: ${rejectedNames.join(", ")}`);
    }
  }

  function onFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    appendFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (disabled) {
      return;
    }

    appendFiles(Array.from(event.dataTransfer.files));
  }

  return (
    <section className="manage-section">
      <div
        className={`manage-dropzone ${disabled ? "is-disabled" : ""}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        role="presentation"
      >
        <input
          id={inputId}
          ref={inputRef}
          className="manage-dropzone__input"
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          onChange={onFileInputChange}
          disabled={disabled}
        />

        <p className="manage-dropzone__eyebrow">Queue new photos</p>
        <h2 className="manage-dropzone__title">Drop JPEG, PNG, or WEBP files here</h2>
        <p className="manage-dropzone__copy">Drop multiple files, adjust each photo metadata in place, then save in one batch.</p>
        <button
          type="button"
          className="manage-button manage-button--secondary"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          Choose files
        </button>
      </div>

      {localError && <p className="manage-status manage-status--error">{localError}</p>}

      {drafts.length > 0 && (
        <>
          <div className="manage-section__header">
            <div>
              <h2 className="manage-section__title">Pending uploads</h2>
              <p className="manage-section__copy">{drafts.length} photo{drafts.length === 1 ? "" : "s"} ready for review.</p>
            </div>

            <button
              type="button"
              className="manage-button manage-button--ghost"
              onClick={clearDrafts}
              disabled={disabled}
            >
              Clear queue
            </button>
          </div>

          <div className="manage-draft-grid">
            {drafts.map((draft) => (
              <article className="manage-draft-card" key={draft.id}>
                <div className="manage-draft-card__media">
                  <img src={draft.previewUrl} alt={draft.title} className="manage-draft-card__image" />
                  <button
                    type="button"
                    className="manage-draft-card__remove"
                    onClick={() => removeDraft(draft.id)}
                    aria-label={`Remove ${draft.title}`}
                    disabled={disabled}
                  >
                    ×
                  </button>
                </div>

                <div className="manage-draft-card__fields">
                  <label className="manage-field">
                    <span>Title</span>
                    <input
                      value={draft.title}
                      onChange={(event) => updateDraft(draft.id, "title", event.target.value)}
                      disabled={disabled}
                    />
                  </label>

                  <label className="manage-field">
                    <span>Description</span>
                    <textarea
                      value={draft.description}
                      onChange={(event) => updateDraft(draft.id, "description", event.target.value)}
                      rows={3}
                      disabled={disabled}
                    />
                  </label>

                  <div className="manage-field-row">
                    <label className="manage-field">
                      <span>Country</span>
                      <input
                        value={draft.country}
                        onChange={(event) => updateDraft(draft.id, "country", event.target.value)}
                        placeholder="FR"
                        disabled={disabled}
                      />
                    </label>

                    <label className="manage-field">
                      <span>City</span>
                      <input
                        value={draft.city}
                        onChange={(event) => updateDraft(draft.id, "city", event.target.value)}
                        placeholder="Paris"
                        disabled={disabled}
                      />
                    </label>

                    <label className="manage-field">
                      <span>Year</span>
                      <input
                        value={draft.captureYear}
                        onChange={(event) => updateDraft(draft.id, "captureYear", event.target.value)}
                        inputMode="numeric"
                        placeholder="2026"
                        disabled={disabled}
                      />
                    </label>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
