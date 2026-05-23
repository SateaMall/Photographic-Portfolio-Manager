import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { deleteCurrentUser as deleteCurrentUserRequest } from "../../../../../../../api/auth";
import { fetchManagedProfileStats, updateManagedProfile } from "../../../../../../../api/manage";
import { useGalleryProfile } from "../../../../../../../layouts/GalleryProfileContext";
import type { ManagedProfileStatsResponse } from "../../../../../../../types/types";
import { useManageAccess } from "../../../shared/hooks/useManageAccess";
import { readErrorMessage } from "../../../shared/utils/manageErrors";
import "../../../ManagePage.css";
import { DeleteAccountSection } from "../components/DeleteAccountSection";
import { ProfileColorsSection } from "../components/ProfileColorsSection";
import { ProfileIdentitySection } from "../components/ProfileIdentitySection";
import { ProfileStatisticsSection } from "../components/ProfileStatisticsSection";
import { ProfileSocialSection } from "../components/ProfileSocialSection";
import { isHexColor } from "../utils/profileColors";
import { draftFromProfile, type ProfileDraft } from "../utils/profileDraft";

export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const { authLoading, canManage, profileSlug, refreshSession } = useManageAccess();
  const { profile, refreshProfile } = useGalleryProfile();
  const [draft, setDraft] = useState<ProfileDraft>(() => draftFromProfile(profile));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsState, setStatsState] = useState<{
    slug: string;
    stats: ManagedProfileStatsResponse | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (!canManage) {
      return;
    }

    setDraft(draftFromProfile(profile));
    setError(null);
  }, [canManage, profile]);

  useEffect(() => {
    if (authLoading || !canManage || !profileSlug) {
      return;
    }

    let cancelled = false;
    setStatsLoading(true);
    setStatsState((currentState) => (
      currentState?.slug === profileSlug
        ? { ...currentState, error: null }
        : { slug: profileSlug, stats: null, error: null }
    ));

    fetchManagedProfileStats(profileSlug)
      .then((stats) => {
        if (!cancelled) {
          setStatsState({ slug: profileSlug, stats, error: null });
        }
      })
      .catch((caughtError) => {
        if (!cancelled) {
          setStatsState({
            slug: profileSlug,
            stats: null,
            error: readErrorMessage(caughtError, "Failed to load your portfolio statistics."),
          });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setStatsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, canManage, profileSlug]);

  function updateField(field: keyof ProfileDraft, value: string) {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
    setError(null);
    setSuccess(null);
  }

  async function onSave() {
    const normalizedDisplayName = draft.displayName.trim();
    const normalizedPrimaryColor = draft.primaryColor.trim();

    if (!normalizedDisplayName) {
      setError("Display name is required.");
      return;
    }

    if (normalizedPrimaryColor && !isHexColor(normalizedPrimaryColor)) {
      setError("Primary color must be a valid hex value.");
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
        secondaryColor: normalizedPrimaryColor,
        publicEmail: draft.publicEmail,
        linkedIn: draft.linkedIn,
        instagram: draft.instagram,
      });

      const refreshedProfile = await refreshProfile();
      setDraft(draftFromProfile(refreshedProfile));
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

  if (authLoading) {
    return <p className="manage-empty">Loading profile settings...</p>;
  }

  if (!canManage) {
    return <p className="manage-status manage-status--error">This page is only available for your own main profile.</p>;
  }

  const currentStatsState = statsState?.slug === profileSlug ? statsState : null;
  const isStatsLoading = statsLoading && currentStatsState?.stats === null;
  const stats = currentStatsState?.stats ?? null;
  const statsError = currentStatsState?.error ?? null;

  return (
    <div className="manage-panel">
      <header className="manage-hero manage-hero--panel">
        <p className="manage-hero__eyebrow">Profile configuration</p>
        <h1 className="manage-hero__title">Tune the identity of your gallery.</h1>
        <p className="manage-hero__copy">Update your colors, display name and public contact details</p>
      </header>

      <div className="manage-profile-grid">
        <div className="manage-profile-grid__main">
          <ProfileIdentitySection draft={draft} disabled={saving || deleting} onChange={updateField} />
          <ProfileColorsSection draft={draft} disabled={saving || deleting} onChange={updateField} />
          <ProfileSocialSection draft={draft} disabled={saving || deleting} onChange={updateField} />
          <ProfileStatisticsSection
            stats={stats}
            loading={isStatsLoading}
            refreshing={statsLoading && currentStatsState?.stats !== null}
            error={statsError}
          />
          <DeleteAccountSection disabled={saving || deleting} deleting={deleting} onDelete={onDeleteAccount} />

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
