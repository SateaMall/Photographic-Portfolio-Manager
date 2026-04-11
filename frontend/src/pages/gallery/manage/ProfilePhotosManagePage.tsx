import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { uploadManagedPhoto } from "../../../api/manage";
import { useAuth } from "../../../auth/AuthContext";
import { Navbar } from "../components/navigation/Navbar";
import type { UploadPhotoDraft } from "../../../types/types";
import { PhotoUploadQueue } from "./components/PhotoUploadQueue";
import { revokeUploadDrafts } from "./components/photoUploadDrafts";
import "./ManagePage.css";

function normalizeSlug(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function readErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function ProfilePhotosManagePage() {
  const { slug } = useParams();
  const profileSlug = normalizeSlug(slug);
  const { session, isAuthenticated, loading } = useAuth();
  const [drafts, setDrafts] = useState<UploadPhotoDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const draftsRef = useRef<UploadPhotoDraft[]>([]);

  const canManage = isAuthenticated && normalizeSlug(session.profileSlug) === profileSlug;

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  useEffect(() => {
    return () => {
      revokeUploadDrafts(draftsRef.current);
    };
  }, []);

  async function onSave() {
    if (drafts.length === 0) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    const queue = drafts;
    const failedDraftIds = new Set<string>();
    let savedCount = 0;

    for (const draft of queue) {
      try {
        await uploadManagedPhoto(draft);
        savedCount += 1;
      } catch (caughtError) {
        failedDraftIds.add(draft.id);
        setError(readErrorMessage(caughtError, `Failed to upload ${draft.file.name}.`));
      }
    }

    const successfulDrafts = queue.filter((draft) => !failedDraftIds.has(draft.id));
    if (successfulDrafts.length > 0) {
      revokeUploadDrafts(successfulDrafts);
    }

    const failedDrafts = queue.filter((draft) => failedDraftIds.has(draft.id));
    setDrafts(failedDrafts);

    if (savedCount > 0 && failedDraftIds.size === 0) {
      setSuccess(`Saved ${savedCount} photo${savedCount === 1 ? "" : "s"}.`);
    } else if (savedCount > 0) {
      setSuccess(`Saved ${savedCount} photo${savedCount === 1 ? "" : "s"}. Failed uploads stayed in the queue.`);
    }

    setSaving(false);
  }

  return (
    <div className="manage-page">
      <div className="manage-page__topbar">
        <Navbar />
      </div>

      <main className="manage-page__content">
        <header className="manage-hero">
          <p className="manage-hero__eyebrow">Photo upload</p>
          <h1 className="manage-hero__title">Upload and review your photos.</h1>
        </header>

        {!loading && !canManage && (
          <p className="manage-status manage-status--error">This page is only available for your own main profile.</p>
        )}

        {loading && <p className="manage-empty">Checking your session…</p>}

        {!loading && canManage && (
          <>
            <PhotoUploadQueue drafts={drafts} onDraftsChange={setDrafts} disabled={saving} />

            {error && <p className="manage-status manage-status--error">{error}</p>}
            {success && <p className="manage-status manage-status--success">{success}</p>}

            <div className="manage-actions">
              <div className="manage-actions__group">
                <button
                  type="button"
                  className="manage-button manage-button--primary"
                  onClick={onSave}
                  disabled={saving || drafts.length === 0}
                >
                  {saving ? "Saving…" : "Save photos"}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
