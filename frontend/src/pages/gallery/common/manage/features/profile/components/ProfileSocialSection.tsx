import type { ProfileDraft } from "../utils/profileDraft";

type ProfileSocialSectionProps = {
  draft: ProfileDraft;
  disabled: boolean;
  onChange: (field: keyof ProfileDraft, value: string) => void;
};

export function ProfileSocialSection({ draft, disabled, onChange }: ProfileSocialSectionProps) {
  return (
    <section className="manage-section" id="social-media">
      <div className="manage-section__header">
        <div>
          <h2 className="manage-section__title">Social media</h2>
          <p className="manage-section__copy">Add public links and contact details visible to visitors.</p>
        </div>
      </div>

      <div className="manage-card">
        <div className="manage-form">
          <label className="manage-field">
            <span>Public email</span>
            <input value={draft.publicEmail} onChange={(event) => onChange("publicEmail", event.target.value)} disabled={disabled} />
          </label>

          <label className="manage-field">
            <span>LinkedIn username</span>
            <input value={draft.linkedIn} onChange={(event) => onChange("linkedIn", event.target.value)} disabled={disabled} />
          </label>

          <label className="manage-field">
            <span>Instagram username</span>
            <input value={draft.instagram} onChange={(event) => onChange("instagram", event.target.value)} disabled={disabled} />
          </label>
        </div>
      </div>
    </section>
  );
}
