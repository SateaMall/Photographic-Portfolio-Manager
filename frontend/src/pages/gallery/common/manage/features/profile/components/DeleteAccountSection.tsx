type DeleteAccountSectionProps = {
  disabled: boolean;
  deleting: boolean;
  onDelete: () => void;
};

export function DeleteAccountSection({ disabled, deleting, onDelete }: DeleteAccountSectionProps) {
  return (
    <section className="manage-section" id="privacy">
      <div className="manage-section__header">
        <div>
          <h2 className="manage-section__title">Privacy</h2>
          <p className="manage-section__copy">Control the permanent account removal action from the privacy section of your profile settings.</p>
        </div>
      </div>

      <div className="manage-card manage-card--danger">
        <div className="manage-danger">
          <p className="manage-danger__copy">This action is permanent. It removes your gallery data, storage files, and account access.</p>
          <button type="button" className="manage-button manage-button--danger" onClick={onDelete} disabled={disabled}>
            {deleting ? "Deleting account..." : "Delete account"}
          </button>
        </div>
      </div>
    </section>
  );
}
