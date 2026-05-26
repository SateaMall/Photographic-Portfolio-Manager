import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateManagedProfileSlug } from "../../../../../../../api/manage";
import { changeCurrentPassword, deleteCurrentUser as deleteCurrentUserRequest } from "../../../../../../../api/auth";

import { useManageAccess } from "../../../shared/hooks/useManageAccess";
import { readErrorMessage } from "../../../shared/utils/manageErrors";
import { normalizeSlug } from "../../../shared/utils/manageSlug";
import "../../../ManagePage.css";
import { DeleteAccountSection } from "../components/DeleteAccountSection";

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const { authLoading, canManage, profileSlug, refreshSession, session } = useManageAccess();
  const [deleting, setDeleting] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [slugSaving, setSlugSaving] = useState(false);
  const [passwordDraft, setPasswordDraft] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [slugDraft, setSlugDraft] = useState(session.profileSlug ?? "");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugSuccess, setSlugSuccess] = useState<string | null>(null);



  useEffect(() => {
    setSlugDraft(session.profileSlug ?? "");
  }, [session.profileSlug]);


  async function onSavePassword() {
    if (!passwordDraft.newPassword.trim()) {
      setPasswordError("New password is required.");
      setPasswordSuccess(null);
      return;
    }

    if (passwordDraft.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      setPasswordSuccess(null);
      return;
    }

    if (passwordDraft.newPassword !== passwordDraft.confirmPassword) {
      setPasswordError("New password and confirmation must match.");
      setPasswordSuccess(null);
      return;
    }

    setPasswordSaving(true);
    setDeleteError(null);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      await changeCurrentPassword({
        currentPassword: passwordDraft.currentPassword,
        newPassword: passwordDraft.newPassword,
      });
      setPasswordDraft({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordSuccess("Password updated.");
    } catch (caughtError) {
      setPasswordError(readErrorMessage(caughtError, "Failed to update your password."));
    } finally {
      setPasswordSaving(false);
    }
  }

  async function onSaveSlug() {
    const nextSlug = normalizeSlug(slugDraft);
    if (!nextSlug) {
      setSlugError("Profile link is required.");
      setSlugSuccess(null);
      return;
    }

    setSlugSaving(true);
    setDeleteError(null);
    setSlugError(null);
    setSlugSuccess(null);

    try {
      const result = await updateManagedProfileSlug(profileSlug, nextSlug);
      const nextSession = await refreshSession();
      const resolvedSlug = nextSession.profileSlug ?? result.slug;
      setSlugDraft(resolvedSlug);
      setSlugSuccess("Profile link updated.");
      navigate(`/${resolvedSlug}/manage/account`, { replace: true });
    } catch (caughtError) {
      setSlugError(readErrorMessage(caughtError, "Failed to update your profile link."));
    } finally {
      setSlugSaving(false);
    }
  }

  async function onDeleteAccount() {
    const confirmation = window.prompt("Type DELETE to permanently remove your account, photos, albums, and profile.");
    if (confirmation !== "DELETE") {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteCurrentUserRequest();
      await refreshSession();
      navigate("/", { replace: true });
    } catch (caughtError) {
      setDeleteError(readErrorMessage(caughtError, "Failed to delete your account."));
      setDeleting(false);
    }
  }

  if (authLoading) {
    return <p className="manage-empty">Loading account settings...</p>;
  }

  if (!canManage) {
    return <p className="manage-status manage-status--error">This page is only available for your own main profile.</p>;
  }



  return (
    <div className="manage-panel">
      <header className="manage-hero manage-hero--panel">
        <p className="manage-hero__eyebrow">Account settings</p>
        <h1 className="manage-hero__title">Manage account-level settings.</h1>
      </header>

      <div className="manage-profile-grid">
        <div className="manage-profile-grid__main">
          <section className="manage-section" id="profile-link">
            <div className="manage-section__header">
              <div>
                <h2 className="manage-section__title">Profile link</h2>
                <p className="manage-section__copy">Choose the slug used in your public gallery URL.</p>
              </div>
            </div>

            <div className="manage-card">
              <div className="manage-form">
                <label className="manage-field">
                  <span>Gallery link slug</span>
                  <input
                    type="text"
                    value={slugDraft}
                    onChange={(event) => {
                      setSlugDraft(event.target.value);
                      setDeleteError(null);
                      setSlugError(null);
                      setSlugSuccess(null);
                    }}
                    placeholder="your-gallery-name"
                    disabled={slugSaving || deleting}
                    autoComplete="off"
                  />
                </label>

                <p className="manage-section__copy">Your public link will be `letmelens.com/{normalizeSlug(slugDraft) || "your-gallery-name"}`.</p>

                {slugError && <p className="manage-status manage-status--error">{slugError}</p>}
                {slugSuccess && <p className="manage-status manage-status--success">{slugSuccess}</p>}

                <div className="manage-actions manage-actions--section">
                  <div className="manage-actions__group">
                    <button type="button" className="manage-button manage-button--primary" onClick={onSaveSlug} disabled={slugSaving || deleting}>
                      {slugSaving ? "Saving..." : "Save link"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="manage-section" id="password">
            <div className="manage-section__header">
              <div>
                <h2 className="manage-section__title">Password</h2>
                <p className="manage-section__copy">Change the password used for email sign-in.</p>
              </div>
            </div>

            <div className="manage-card">
              <div className="manage-form">
                <label className="manage-field">
                  <span>Current password</span>
                  <input
                    type="password"
                    value={passwordDraft.currentPassword}
                    onChange={(event) => {
                      setPasswordDraft((current) => ({ ...current, currentPassword: event.target.value }));
                      setDeleteError(null);
                      setPasswordError(null);
                      setPasswordSuccess(null);
                    }}
                    disabled={passwordSaving || deleting}
                    autoComplete="current-password"
                  />
                </label>

                <label className="manage-field">
                  <span>New password</span>
                  <input
                    type="password"
                    value={passwordDraft.newPassword}
                    onChange={(event) => {
                      setPasswordDraft((current) => ({ ...current, newPassword: event.target.value }));
                      setDeleteError(null);
                      setPasswordError(null);
                      setPasswordSuccess(null);
                    }}
                    disabled={passwordSaving || deleting}
                    autoComplete="new-password"
                  />
                </label>

                <label className="manage-field">
                  <span>Confirm new password</span>
                  <input
                    type="password"
                    value={passwordDraft.confirmPassword}
                    onChange={(event) => {
                      setPasswordDraft((current) => ({ ...current, confirmPassword: event.target.value }));
                      setDeleteError(null);
                      setPasswordError(null);
                      setPasswordSuccess(null);
                    }}
                    disabled={passwordSaving || deleting}
                    autoComplete="new-password"
                  />
                </label>

                {passwordError && <p className="manage-status manage-status--error">{passwordError}</p>}
                {passwordSuccess && <p className="manage-status manage-status--success">{passwordSuccess}</p>}

                <div className="manage-actions manage-actions--section">
                  <div className="manage-actions__group">
                    <button type="button" className="manage-button manage-button--primary" onClick={onSavePassword} disabled={passwordSaving || deleting}>
                      {passwordSaving ? "Saving..." : "Update password"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>



          <DeleteAccountSection disabled={deleting || passwordSaving || slugSaving} deleting={deleting} onDelete={onDeleteAccount} />

          {deleteError && <p className="manage-status manage-status--error">{deleteError}</p>}
        </div>
      </div>
    </div>
  );
}
