import type { ProfileDraft } from "../utils/profileDraft";
import { colorInputValue, DEFAULT_PRIMARY_COLOR, DEFAULT_SECONDARY_COLOR } from "../utils/profileColors";

type ProfileColorsSectionProps = {
  draft: ProfileDraft;
  disabled: boolean;
  onChange: (field: keyof ProfileDraft, value: string) => void;
};

export function ProfileColorsSection({ draft, disabled, onChange }: ProfileColorsSectionProps) {
  return (
    <section className="manage-section" id="colors">
      <div className="manage-section__header">
        <div>
          <h2 className="manage-section__title">Colors</h2>
          <p className="manage-section__copy">Set the palette you want to apply to the gallery.</p>
        </div>
      </div>

      <div className="manage-card">
        <div className="manage-form">
          <div className="manage-color-grid">
            <label className="manage-field">
              <span>Primary color</span>
              <div className="manage-color-field">
                <input
                  className="manage-color-field__picker"
                  type="color"
                  value={colorInputValue(draft.primaryColor, DEFAULT_PRIMARY_COLOR)}
                  onChange={(event) => onChange("primaryColor", event.target.value)}
                  disabled={disabled}
                />
                <input
                  value={draft.primaryColor}
                  onChange={(event) => onChange("primaryColor", event.target.value)}
                  placeholder="#111827"
                  disabled={disabled}
                />
              </div>
            </label>

            <label className="manage-field">
              <span>Secondary color</span>
              <div className="manage-color-field">
                <input
                  className="manage-color-field__picker"
                  type="color"
                  value={colorInputValue(draft.secondaryColor, DEFAULT_SECONDARY_COLOR)}
                  onChange={(event) => onChange("secondaryColor", event.target.value)}
                  disabled={disabled}
                />
                <input
                  value={draft.secondaryColor}
                  onChange={(event) => onChange("secondaryColor", event.target.value)}
                  placeholder="#8dff84"
                  disabled={disabled}
                />
              </div>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
