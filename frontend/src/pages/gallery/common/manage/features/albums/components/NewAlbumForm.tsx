type NewAlbumFormProps = {
  title: string;
  description: string;
  creating: boolean;
  error: string | null;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCreate: () => void;
};

export function NewAlbumForm({ title, description, creating, error, onTitleChange, onDescriptionChange, onCreate }: NewAlbumFormProps) {
  return (
    <section className="manage-card manage-card--compact" id="new-album">
      <div className="manage-section__header manage-section__header--stacked">
        <div>
          <h2 className="manage-section__title">New collection</h2>
          <p className="manage-section__copy">Create a fresh collection, then start ordering photos inside it.</p>
        </div>
      </div>

      <div className="manage-form manage-form--compact">
        <label className="manage-field">
          <span>Title</span>
          <input value={title} onChange={(event) => onTitleChange(event.target.value)} disabled={creating} />
        </label>

        <label className="manage-field">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            rows={3}
            disabled={creating}
          />
        </label>

        <button type="button" className="manage-button manage-button--primary" onClick={onCreate} disabled={creating}>
          {creating ? "Creating..." : "Create album"}
        </button>
      </div>

      {error && <p className="manage-status manage-status--error">{error}</p>}
    </section>
  );
}
