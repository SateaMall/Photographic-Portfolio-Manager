import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { deleteCurrentUser as deleteCurrentUserRequest } from "../../../api/auth";
import { updateManagedProfile } from "../../../api/manage";
import { fetchPublicProfile } from "../../../api/profile";
import { useAuth } from "../../../auth/AuthContext";
import type { PublicProfileResponse } from "../../../types/types";
import { emitProfileUpdated } from "../components/profileEvents";
import "./ManagePage.css";

type ProfileDraft = {
  displayName: string;
  bio: string;
  primaryColor: string;
  secondaryColor: string;
  publicEmail: string;
  linkedIn: string;
  instagram: string;
};

const DEFAULT_PRIMARY_COLOR = "#111827";
const DEFAULT_SECONDARY_COLOR = "#e9ff3f";

function normalizeSlug(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function readErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function isHexColor(value: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value.trim());
}

function colorInputValue(value: string, fallback: string) {
  const normalized = value.trim();
  return isHexColor(normalized) && normalized.length === 7 ? normalized : fallback;
}

function draftFromProfile(profile: PublicProfileResponse): ProfileDraft {
  return {
    displayName: profile.displayName,
    bio: profile.bio ?? "",
    primaryColor: profile.primaryColor ?? "",
    secondaryColor: profile.secondaryColor ?? "",
    publicEmail: profile.publicEmail ?? "",
    linkedIn: profile.linkedIn ?? "",
    instagram: profile.instagram ?? "",
  };
}

export default function ProfileSettingsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const profileSlug = normalizeSlug(slug);
  const { session, isAuthenticated, loading: authLoading, refreshSession } = useAuth();
  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canManage = isAuthenticated && normalizeSlug(session.profileSlug) === profileSlug;

  useEffect(() => {
    let cancelled = false;

    if (authLoading || !canManage || !profileSlug) {
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);

    fetchPublicProfile(profileSlug)
      .then((nextProfile) => {
        if (!cancelled) {
          setProfile(nextProfile);
          setDraft(draftFromProfile(nextProfile));
          setError(null);
        }
      })
      .catch((caughtError) => {
        if (!cancelled) {
          setError(readErrorMessage(caughtError, "Unable to load your profile settings."));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, canManage, profileSlug]);

  function updateField(field: keyof ProfileDraft, value: string) {
    setDraft((currentDraft) => (currentDraft ? { ...currentDraft, [field]: value } : currentDraft));
    setError(null);
    setSuccess(null);
  }

  async function onSave() {
    if (!draft) {
      return;
    }

    const normalizedDisplayName = draft.displayName.trim();
    const normalizedPrimaryColor = draft.primaryColor.trim();
    const normalizedSecondaryColor = draft.secondaryColor.trim();

    if (!normalizedDisplayName) {
      setError("Display name is required.");
      return;
    }

    if (normalizedPrimaryColor && !isHexColor(normalizedPrimaryColor)) {
      setError("Primary color must be a valid hex value.");
      return;
    }

    if (normalizedSecondaryColor && !isHexColor(normalizedSecondaryColor)) {
      setError("Secondary color must be a valid hex value.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateManagedProfile(profileSlug, {
        displayName: normalizedDisplayName,
        bio: draft.bio,
        primaryColor: normalizedPrimaryColor,
        secondaryColor: normalizedSecondaryColor,
        publicEmail: draft.publicEmail,
        linkedIn: draft.linkedIn,
        instagram: draft.instagram,
      });

      const refreshedProfile = await fetchPublicProfile(profileSlug);
      setProfile(refreshedProfile);
      setDraft(draftFromProfile(refreshedProfile));
      emitProfileUpdated(refreshedProfile);
      await refreshSession();
      setSuccess("Profile settings saved.");
    } catch (caughtError) {
      setError(readErrorMessage(caughtError, "Failed to save your profile settings."));
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteAccount() {
    const confirmation = window.prompt("Type DELETE to permanently remove your account, photos, albums, and profile.");
    if (confirmation !== "DELETE") {
      return;
    }

    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteCurrentUserRequest();
      await refreshSession();
      navigate("/", { replace: true });
    } catch (caughtError) {
      setError(readErrorMessage(caughtError, "Failed to delete your account."));
      setDeleting(false);
    }
  }

  if (authLoading || loading) {
    return <p className="manage-empty">Loading profile settings...</p>;
  }

  if (!canManage) {
    return <p className="manage-status manage-status--error">This page is only available for your own main profile.</p>;
  }

  if (!draft || !profile) {
    return <p className="manage-status manage-status--error">Unable to load your profile settings.</p>;
  }

  return (
    <div className="manage-panel">
      <header className="manage-hero manage-hero--panel">
        <p className="manage-hero__eyebrow">Profile configuration</p>
        <h1 className="manage-hero__title">Tune the identity of your gallery.</h1>
        <p className="manage-hero__copy">Update your colors, display name and public contact details</p>
      </header>

      <div className="manage-profile-grid">
        <div className="manage-profile-grid__main">
          <section className="manage-section" id="display-name">
            <div className="manage-section__header">
              <div>
                <h2 className="manage-section__title">About me<menu type="context"></menu></h2>
              </div>
            </div>

            <div className="manage-card">
              <div className="manage-form">
                <label className="manage-field">
                  <span>Display name</span>
                  <input value={draft.displayName} onChange={(event) => updateField("displayName", event.target.value)} disabled={saving || deleting} />
                </label>

                <label className="manage-field">
                  <span>Bio</span>
                  <textarea value={draft.bio} onChange={(event) => updateField("bio", event.target.value)} rows={5} disabled={saving || deleting} />
                </label>
              </div>
            </div>
          </section>

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
                        onChange={(event) => updateField("primaryColor", event.target.value)}
                        disabled={saving || deleting}
                      />
                      <input
                        value={draft.primaryColor}
                        onChange={(event) => updateField("primaryColor", event.target.value)}
                        placeholder="#111827"
                        disabled={saving || deleting}
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
                        onChange={(event) => updateField("secondaryColor", event.target.value)}
                        disabled={saving || deleting}
                      />
                      <input
                        value={draft.secondaryColor}
                        onChange={(event) => updateField("secondaryColor", event.target.value)}
                        placeholder="#8dff84"
                        disabled={saving || deleting}
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </section>

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
                  <input value={draft.publicEmail} onChange={(event) => updateField("publicEmail", event.target.value)} disabled={saving || deleting} />
                </label>

                <label className="manage-field">
                  <span>LinkedIn username</span>
                  <input value={draft.linkedIn} onChange={(event) => updateField("linkedIn", event.target.value)} disabled={saving || deleting} />
                </label>

                <label className="manage-field">
                  <span>Instagram username</span>
                  <input value={draft.instagram} onChange={(event) => updateField("instagram", event.target.value)} disabled={saving || deleting} />
                </label>
              </div>
            </div>
          </section>

          <section className="manage-section">
            <div className="manage-section__header">
              <div>
                <h2 className="manage-section__title">Danger zone</h2>
                <p className="manage-section__copy">Delete the entire account and remove every photo, album, profile, and verification record tied to it.</p>
              </div>
            </div>

            <div className="manage-card manage-card--danger">
              <div className="manage-danger">
                <p className="manage-danger__copy">This action is permanent. It removes your gallery data, storage files, and account access.</p>
                <button type="button" className="manage-button manage-button--danger" onClick={onDeleteAccount} disabled={saving || deleting}>
                  {deleting ? "Deleting account..." : "Delete account"}
                </button>
              </div>
            </div>
          </section>

          {error && <p className="manage-status manage-status--error">{error}</p>}
          {success && <p className="manage-status manage-status--success">{success}</p>}

          <div className="manage-actions">
            <div className="manage-actions__group">
              <button type="button" className="manage-button manage-button--primary" onClick={onSave} disabled={saving || deleting}>
                {saving ? "Saving..." : "Save profile"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
