import type { UploadPhotoDraft } from "../../../../../../../types/types";
import { PhotoUploadQueue } from "./PhotoUploadQueue";

type PhotoUploadSectionProps = {
  drafts: UploadPhotoDraft[];
  onDraftsChange: (drafts: UploadPhotoDraft[]) => void;
  disabled: boolean;
  error: string | null;
  success: string | null;
  onSave: () => void;
};

export function PhotoUploadSection({ drafts, onDraftsChange, disabled, error, success, onSave }: PhotoUploadSectionProps) {
  return (
    <>
      <div id="queue">
        <PhotoUploadQueue drafts={drafts} onDraftsChange={onDraftsChange} disabled={disabled} />
      </div>

      {error && <p className="manage-status manage-status--error">{error}</p>}
      {success && <p className="manage-status manage-status--success">{success}</p>}

      <div className="manage-actions">
        <div className="manage-actions__group">
          <button
            type="button"
            className="manage-button manage-button--primary"
            onClick={onSave}
            disabled={disabled || drafts.length === 0}
          >
            {disabled ? "Saving..." : "Save photos"}
          </button>
        </div>
      </div>
    </>
  );
}
