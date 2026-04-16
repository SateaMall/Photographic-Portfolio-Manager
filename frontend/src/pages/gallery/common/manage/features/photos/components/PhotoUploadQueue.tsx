import { useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";

import { CountryCodeField } from "../../../../../../../components/forms/CountryCodeField";
import type { UploadPhotoDraft } from "../../../../../../../types/types";
import { createUploadPhotoDraft, isAcceptedUploadFile, revokeUploadDrafts } from "../utils/photoUploadDrafts";
import "../../../components/PhotoUploadQueue.css";

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
  const [isPreparingDrafts, setIsPreparingDrafts] = useState(false);
  const isBusy = disabled || isPreparingDrafts;

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

  async function appendFiles(files: File[]) {
    if (files.length === 0) {
      return;
    }

    const existingKeys = new Set(drafts.map((draft) => buildFileKey(draft.file)));
    const rejectedNames: string[] = [];
    const acceptedFiles: File[] = [];

    files.forEach((file) => {
      const fileKey = buildFileKey(file);

      if (!isAcceptedUploadFile(file) || existingKeys.has(fileKey)) {
        rejectedNames.push(file.name);
        return;
      }

      existingKeys.add(fileKey);
      acceptedFiles.push(file);
    });

    if (acceptedFiles.length > 0) {
      setIsPreparingDrafts(true);

      try {
        const nextDrafts = await Promise.all(acceptedFiles.map((file) => createUploadPhotoDraft(file)));
        onDraftsChange([...drafts, ...nextDrafts]);
        setLocalError(null);
      } finally {
        setIsPreparingDrafts(false);
      }
    }

    if (rejectedNames.length > 0) {
      setLocalError(`Skipped unsupported or duplicate files: ${rejectedNames.join(", ")}`);
    }
  }

  function onFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    void appendFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (disabled) {
      return;
    }

    void appendFiles(Array.from(event.dataTransfer.files));
  }

  return (
    <section className="manage-section">
      <div
        className={`manage-dropzone ${isBusy ? "is-disabled" : ""}`}
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
          disabled={isBusy}
        />

        <p className="manage-dropzone__eyebrow">Queue new photos</p>
        <h2 className="manage-dropzone__title">Drop JPEG, PNG, or WEBP files here</h2>
        <p className="manage-dropzone__copy">Drop multiple files, adjust each photo metadata in place, then save in one batch. Year auto-fills from photo metadata when available.</p>
        <button
          type="button"
          className="manage-button manage-button--secondary"
          onClick={() => inputRef.current?.click()}
          disabled={isBusy}
        >
          {isPreparingDrafts ? "Reading metadata..." : "Choose files"}
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
              disabled={isBusy}
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
                    disabled={isBusy}
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
                      disabled={isBusy}
                    />
                  </label>

                  <label className="manage-field">
                    <span>Description</span>
                    <textarea
                      value={draft.description}
                      onChange={(event) => updateDraft(draft.id, "description", event.target.value)}
                      rows={3}
                      disabled={isBusy}
                    />
                  </label>

                  <div className="manage-field-row">
                    <label className="manage-field">
                      <span>Country</span>
                      <CountryCodeField
                        value={draft.country}
                        onChange={(value) => updateDraft(draft.id, "country", value)}
                        disabled={isBusy}
                      />
                    </label>

                    <label className="manage-field">
                      <span>City</span>
                      <input
                        value={draft.city}
                        onChange={(event) => updateDraft(draft.id, "city", event.target.value)}
                        placeholder="Paris"
                        disabled={isBusy}
                      />
                    </label>

                    <label className="manage-field">
                      <span>Year</span>
                      <input
                        value={draft.captureYear}
                        onChange={(event) => updateDraft(draft.id, "captureYear", event.target.value)}
                        inputMode="numeric"
                        placeholder="2026"
                        disabled={isBusy}
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
