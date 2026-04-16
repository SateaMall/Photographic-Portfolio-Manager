import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { deleteManagedPhoto, updateManagedPhoto } from "../../../../api/manage";
import { fetchAlbumItemsAsPhotos, fetchMainPhoto } from "../../../../api/photo-album";
import { useAuth } from "../../../../auth/AuthContext";
import { useGalleryProfile } from "../../../../layouts/GalleryProfileContext";
import type { MainPhotoResponse, PhotoResponse } from "../../../../types/types";
import { emitPhotoDeleted, emitPhotoUpdated } from "./components/photoEvents";
import { PhotoNavbar } from "./components/PhotoNavbar";
import { PhotosGrid } from "../components/PhotosGrid";
import PhotoInfo from "./components/PhotoInfo";
import PhotoViewer from "./components/PhotoViewer";
import "./PhotoPage.css";

type PhotoPageProps = {
  lightboxPortalContainer?: HTMLElement | null;
  lightboxKey?: string;
};

type Params = { slug?: string; photoId: string; albumId?: string };

type PhotoEditDraft = {
  title: string;
  description: string;
  country: string;
  city: string;
  captureYear: string;
};

function toPhotoEditDraft(photo: MainPhotoResponse): PhotoEditDraft {
  return {
    title: photo.title ?? "",
    description: photo.description ?? "",
    country: photo.country ?? "",
    city: photo.city ?? "",
    captureYear: photo.captureYear == null ? "" : String(photo.captureYear),
  };
}

function toPhotoResponse(photo: MainPhotoResponse, owner: string): PhotoResponse {
  return {
    id: photo.id,
    owner,
    createdAt: photo.createdAt,
    title: photo.title,
    description: photo.description,
    country: photo.country,
    city: photo.city,
    captureYear: photo.captureYear,
  };
}

function readErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function PhotoPage({ lightboxPortalContainer, lightboxKey }: PhotoPageProps) {
  const { profile: mainProfile } = useGalleryProfile();
  const [mainPhoto, setMainPhoto] = useState<MainPhotoResponse | null>(null);
  const [editDraft, setEditDraft] = useState<PhotoEditDraft | null>(null);
  const [photos, setPhotos] = useState<PhotoResponse[] | null>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { slug, photoId, albumId } = useParams<Params>();
  const inAlbum = Boolean(albumId);
  const navigate = useNavigate();
  const location = useLocation();
  const { session, isAuthenticated } = useAuth();
  const isModalOpen = Boolean(location.state?.backgroundLocation);
  const canManage = isAuthenticated && session.profileSlug?.trim().toLowerCase() === slug?.trim().toLowerCase();
  const isSubmitting = isSaving || isDeleting;
  const photographerName = mainProfile.displayName?.trim() || mainProfile.slug;

  useEffect(() => {
    if (!photoId || !slug) return;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const photo = await fetchMainPhoto(slug, photoId);

        setMainPhoto(photo);
        setEditDraft(toPhotoEditDraft(photo));
        setIsEditing(false);
        setActionError(null);
        setActionSuccess(null);

        if (inAlbum && albumId) {
          const albumPhotos = await fetchAlbumItemsAsPhotos(albumId);
          setPhotos(albumPhotos.content);
        } else {
          setPhotos([]);
        }
      } catch {
        setError("Failed to load photo.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, photoId, inAlbum, albumId]);

  useEffect(() => {
    if (!mainPhoto) return;
    document.title = mainPhoto.title?.trim() || "Let Me Lens";
  }, [mainPhoto]);

  if (!photoId || !slug) return null;

  function updateDraftField(field: keyof PhotoEditDraft, value: string) {
    setEditDraft((currentDraft) => currentDraft ? { ...currentDraft, [field]: value } : currentDraft);
    setActionError(null);
    setActionSuccess(null);
  }

  function startEditing() {
    if (!mainPhoto) {
      return;
    }

    setEditDraft(toPhotoEditDraft(mainPhoto));
    setIsEditing(true);
    setActionError(null);
    setActionSuccess(null);
  }

  function cancelEditing() {
    if (!mainPhoto) {
      return;
    }

    setEditDraft(toPhotoEditDraft(mainPhoto));
    setIsEditing(false);
    setActionError(null);
    setActionSuccess(null);
  }

  async function savePhotoChanges() {
    if (!mainPhoto || !editDraft || !slug) {
      return;
    }

    const normalizedTitle = editDraft.title.trim();
    const normalizedCaptureYear = editDraft.captureYear.trim();

    if (!normalizedTitle) {
      setActionError("Title is required.");
      return;
    }

    if (normalizedCaptureYear && !/^\d{4}$/.test(normalizedCaptureYear)) {
      setActionError("Capture year must be a 4-digit year.");
      return;
    }

    setIsSaving(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await updateManagedPhoto(mainPhoto.id, {
        ...editDraft,
        title: normalizedTitle,
        captureYear: normalizedCaptureYear,
      });

      const refreshedPhoto = await fetchMainPhoto(slug, mainPhoto.id);
      setMainPhoto(refreshedPhoto);
      setEditDraft(toPhotoEditDraft(refreshedPhoto));
      setIsEditing(false);
      setActionSuccess("Photo updated.");
      emitPhotoUpdated(toPhotoResponse(refreshedPhoto, slug));
    } catch (caughtError) {
      setActionError(readErrorMessage(caughtError, "Failed to update this photo."));
    } finally {
      setIsSaving(false);
    }
  }

  async function deletePhoto() {
    if (!mainPhoto || !slug) {
      return;
    }

    if (!window.confirm("Delete this photo permanently?")) {
      return;
    }

    setIsDeleting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await deleteManagedPhoto(mainPhoto.id);
      emitPhotoDeleted(mainPhoto.id);

      if (isModalOpen) {
        navigate(-1);
        return;
      }

      navigate(albumId ? `/${slug}/album/${albumId}` : `/${slug}`, { replace: true });
    } catch (caughtError) {
      setActionError(readErrorMessage(caughtError, "Failed to delete this photo."));
      setIsDeleting(false);
    }
  }

  return (
    <section className={`photo-page ${!isModalOpen ? "background__noModule" : ""}`}>
      {!isModalOpen && <div className="navigationBar"><PhotoNavbar photographerName={photographerName} profilePath={`/${mainProfile.slug}`} /></div>}

      {loading && <p className="photo-page__status">Loading photo...</p>}
      {error && <p className="photo-page__status photo-page__status--error">{error}</p>}

      {!loading && !error && mainPhoto && (
        <>
          <div className="photo-page__hero">
            <div className="photo-page__viewer">
              <PhotoViewer
                photoId={photoId}
                profileSlug={slug}
                mainPhoto={mainPhoto}
                photos={photos}
                lightboxPortalContainer={lightboxPortalContainer}
                lightboxKey={lightboxKey}
              />
            </div>

            <div className="photo-page__meta" aria-label="Photo details">
              <PhotoInfo
                mainPhoto={mainPhoto}
                mainProfile={mainProfile}
                canManage={canManage}
                isEditing={isEditing}
                editDraft={editDraft}
                isSubmitting={isSubmitting}
                actionError={actionError}
                actionSuccess={actionSuccess}
                onStartEdit={startEditing}
                onCancelEdit={cancelEditing}
                onSave={savePhotoChanges}
                onDelete={deletePhoto}
                onChangeField={updateDraftField}
              />
            </div>
          </div>

          {!inAlbum && (
            <div className="photo-page__related">
              <h2 className="photo-page__h2">Related photos</h2>
              <PhotosGrid photoId={photoId} onPhotosChange={setPhotos} />
            </div>
          )}
        </>
      )}
    </section>
  );
}
