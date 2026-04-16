import type { ProfileDraft } from "../utils/profileDraft";

type ProfileIdentitySectionProps = {
  draft: ProfileDraft;
  disabled: boolean;
  onChange: (field: keyof ProfileDraft, value: string) => void;
};

export function ProfileIdentitySection({ draft, disabled, onChange }: ProfileIdentitySectionProps) {
  return (
    <section className="manage-section" id="display-name">
      <div className="manage-section__header">
        <div>
          <h2 className="manage-section__title">About me</h2>
        </div>
      </div>

      <div className="manage-card">
        <div className="manage-form">
          <label className="manage-field">
            <span>Display name</span>
            <input value={draft.displayName} onChange={(event) => onChange("displayName", event.target.value)} disabled={disabled} />
          </label>

          <label className="manage-field">
            <span>Bio</span>
            <textarea value={draft.bio} onChange={(event) => onChange("bio", event.target.value)} rows={5} disabled={disabled} />
          </label>
        </div>
      </div>
    </section>
  );
}
