type AlbumDetailsFormProps = {
  title: string;
  description: string;
  disabled: boolean;
  saving: boolean;
  deleting: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSave: () => void;
  onDelete: () => void;
};

export function AlbumDetailsForm({
  title,
  description,
  disabled,
  saving,
  deleting,
  onTitleChange,
  onDescriptionChange,
  onSave,
  onDelete,
}: AlbumDetailsFormProps) {
  return (
    <section className="manage-section">
      <div className="manage-section__header">
        <div>
          <h2 className="manage-section__title">Album details</h2>
          <p className="manage-section__copy">Rename the album and keep its description aligned with the story you want to tell.</p>
        </div>
      </div>

      <div className="manage-card">
        <div className="manage-form">
          <label className="manage-field">
            <span>Title</span>
            <input value={title} onChange={(event) => onTitleChange(event.target.value)} disabled={disabled} />
          </label>

          <label className="manage-field">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              rows={4}
              disabled={disabled}
            />
          </label>
        </div>
      </div>

      <div className="manage-actions manage-actions--section">
        <div className="manage-actions__group">
          <button type="button" className="manage-button manage-button--primary" onClick={onSave} disabled={disabled}>
            {saving ? "Saving..." : "Save album"}
          </button>
          <button type="button" className="manage-button manage-button--danger" onClick={onDelete} disabled={disabled}>
            {deleting ? "Deleting..." : "Delete album"}
          </button>
        </div>
      </div>
    </section>
  );
}
