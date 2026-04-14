import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import * as Collapsible from "@radix-ui/react-collapsible";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BsGripVertical } from "react-icons/bs";

import {
  addPhotoToManagedAlbum,
  createManagedAlbum,
  deleteManagedAlbum,
  fetchAllManageablePhotos,
  fetchManageableAlbums,
  fetchManagedAlbum,
  removePhotoFromManagedAlbum,
  reorderManagedAlbumPhotos,
  updateManagedAlbum,
  uploadManagedPhoto,
} from "../../../api/manage";
import { photoFileUrl } from "../../../api/photos";
import { useAuth } from "../../../auth/AuthContext";
import type {
  AlbumViewResponse,
  ManagedAlbumResponse,
  ManagedPhotoResponse,
  UploadPhotoDraft,
} from "../../../types/types";
import { PhotoUploadQueue } from "./components/PhotoUploadQueue";
import { revokeUploadDrafts } from "./components/photoUploadDrafts";
import "./ManagePage.css";

type AlbumListState = {
  slug: string;
  albums: AlbumViewResponse[];
  error: string | null;
};

type PhotoLibraryState = {
  slug: string;
  photos: ManagedPhotoResponse[];
  error: string | null;
};

type SelectedAlbumState = {
  albumId: string;
  album: ManagedAlbumResponse | null;
  error: string | null;
};

type AlbumEditorPanelProps = {
  profileSlug: string;
  album: ManagedAlbumResponse;
  allPhotos: ManagedPhotoResponse[];
  onRefreshAlbums: () => Promise<AlbumViewResponse[]>;
  onRefreshAlbum: (albumId: string) => Promise<ManagedAlbumResponse>;
  onRefreshPhotoLibrary: () => Promise<ManagedPhotoResponse[]>;
  onDeleteAlbum: (albumId: string) => Promise<void>;
};

type SortableAlbumPhotoCardProps = {
  profileSlug: string;
  photo: ManagedPhotoResponse;
  disabled: boolean;
  onRemove: () => void;
};

function normalizeSlug(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function readErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatPhotoMeta(photo: ManagedPhotoResponse) {
  const parts = [photo.city, photo.country, photo.captureYear ? String(photo.captureYear) : null].filter(Boolean);
  return parts.length > 0 ? parts.join(" • ") : "No metadata yet";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function SortableAlbumPhotoCard({ profileSlug, photo, disabled, onRemove }: SortableAlbumPhotoCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`manage-sortable-card ${isDragging ? "is-dragging" : ""}`}
    >
      <img
        className="manage-sortable-card__image"
        src={photoFileUrl(photo.id, profileSlug, "THUMB")}
        alt={photo.title ?? ""}
        loading="lazy"
      />

      <div className="manage-sortable-card__body">
        <div className="manage-sortable-card__header">
          <button
            type="button"
            className="manage-sortable-card__handle"
            aria-label={`Reorder ${photo.title ?? "photo"}`}
            disabled={disabled}
            {...attributes}
            {...listeners}
          >
            <BsGripVertical />
          </button>

          <button
            type="button"
            className="manage-button manage-button--ghost manage-button--compact"
            onClick={onRemove}
            disabled={disabled}
          >
            Remove
          </button>
        </div>

        <div>
          <h3 className="manage-sortable-card__title">{photo.title?.trim() || "Untitled"}</h3>
          <p className="manage-sortable-card__meta">{formatPhotoMeta(photo)}</p>
        </div>
      </div>
    </article>
  );
}

function AlbumEditorPanel({
  profileSlug,
  album,
  allPhotos,
  onRefreshAlbums,
  onRefreshAlbum,
  onRefreshPhotoLibrary,
  onDeleteAlbum,
}: AlbumEditorPanelProps) {
  const [title, setTitle] = useState(album.title);
  const [description, setDescription] = useState(album.description ?? "");
  const [orderedPhotoIds, setOrderedPhotoIds] = useState<string[]>(album.photos.map((photo) => photo.id));
  const [drafts, setDrafts] = useState<UploadPhotoDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const draftsRef = useRef<UploadPhotoDraft[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const allPhotosById = useMemo(() => {
    const map = new Map<string, ManagedPhotoResponse>();
    allPhotos.forEach((photo) => {
      map.set(photo.id, photo);
    });
    album.photos.forEach((photo) => {
      if (!map.has(photo.id)) {
        map.set(photo.id, photo);
      }
    });
    return map;
  }, [album.photos, allPhotos]);

  const orderedPhotos = orderedPhotoIds
    .map((photoId) => allPhotosById.get(photoId))
    .filter((photo): photo is ManagedPhotoResponse => photo != null);

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  useEffect(() => {
    return () => {
      revokeUploadDrafts(draftsRef.current);
    };
  }, []);

  function togglePhoto(photoId: string) {
    setOrderedPhotoIds((currentPhotoIds) => (
      currentPhotoIds.includes(photoId)
        ? currentPhotoIds.filter((currentId) => currentId !== photoId)
        : [...currentPhotoIds, photoId]
    ));
    setError(null);
    setSuccess(null);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setOrderedPhotoIds((currentPhotoIds) => {
      const oldIndex = currentPhotoIds.indexOf(String(active.id));
      const newIndex = currentPhotoIds.indexOf(String(over.id));

      if (oldIndex === -1 || newIndex === -1) {
        return currentPhotoIds;
      }

      return arrayMove(currentPhotoIds, oldIndex, newIndex);
    });
    setError(null);
    setSuccess(null);
  }

  async function onSave() {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      setError("Album title is required.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    const failures: string[] = [];
    const initialIds = album.photos.map((photo) => photo.id);
    const nextIds = orderedPhotoIds;
    const initialIdSet = new Set(initialIds);
    const nextIdSet = new Set(nextIds);
    const toRemove = initialIds.filter((photoId) => !nextIdSet.has(photoId));
    const toAdd = nextIds.filter((photoId) => !initialIdSet.has(photoId));
    const queue = drafts;
    const failedDraftIds = new Set<string>();
    const uploadedPhotoIds: string[] = [];

    try {
      await updateManagedAlbum(album.albumId, { title: normalizedTitle, description });
    } catch (caughtError) {
      failures.push(readErrorMessage(caughtError, "Failed to save the album details."));
    }

    for (const photoId of toRemove) {
      try {
        await removePhotoFromManagedAlbum(album.albumId, photoId);
      } catch (caughtError) {
        failures.push(readErrorMessage(caughtError, `Failed to remove photo ${photoId} from the album.`));
      }
    }

    for (const photoId of toAdd) {
      try {
        await addPhotoToManagedAlbum(album.albumId, photoId);
      } catch (caughtError) {
        failures.push(readErrorMessage(caughtError, `Failed to add photo ${photoId} to the album.`));
      }
    }

    for (const draft of queue) {
      try {
        const uploadedPhoto = await uploadManagedPhoto(draft, album.albumId);
        uploadedPhotoIds.push(uploadedPhoto.id);
      } catch (caughtError) {
        failedDraftIds.add(draft.id);
        failures.push(readErrorMessage(caughtError, `Failed to upload ${draft.file.name}.`));
      }
    }

    const finalOrder = [...nextIds, ...uploadedPhotoIds];
    if (finalOrder.length > 0) {
      try {
        await reorderManagedAlbumPhotos(album.albumId, finalOrder);
      } catch (caughtError) {
        failures.push(readErrorMessage(caughtError, "Failed to save the album photo order."));
      }
    }

    const successfulDrafts = queue.filter((draft) => !failedDraftIds.has(draft.id));
    if (successfulDrafts.length > 0) {
      revokeUploadDrafts(successfulDrafts);
    }

    setDrafts(queue.filter((draft) => failedDraftIds.has(draft.id)));

    try {
      await onRefreshAlbums();
      const refreshedAlbum = await onRefreshAlbum(album.albumId);
      setTitle(refreshedAlbum.title);
      setDescription(refreshedAlbum.description ?? "");
      setOrderedPhotoIds(refreshedAlbum.photos.map((photo) => photo.id));
      if (uploadedPhotoIds.length > 0) {
        await onRefreshPhotoLibrary();
      }
    } catch (caughtError) {
      failures.push(readErrorMessage(caughtError, "Saved some changes, but the workspace could not refresh."));
    }

    if (failures.length > 0) {
      setError(failures.join(" "));
    }

    if (failures.length === 0) {
      setSuccess(`Album saved. ${finalOrder.length} photo${finalOrder.length === 1 ? "" : "s"} currently in the album.`);
    } else if (finalOrder.length > 0 || uploadedPhotoIds.length > 0) {
      setSuccess("Partial save completed.");
    }

    setSaving(false);
  }

  async function onDelete() {
    if (!window.confirm(`Delete album "${album.title}" permanently?`)) {
      return;
    }

    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      await onDeleteAlbum(album.albumId);
    } catch (caughtError) {
      setError(readErrorMessage(caughtError, "Failed to delete this album."));
      setDeleting(false);
    }
  }

  const libraryPhotoIds = new Set(orderedPhotoIds);
  const isBusy = saving || deleting;

  return (
    <div className="manage-detail">
      <section className="manage-section">
        <div className="manage-section__header">
          <div>
            <h2 className="manage-section__title">Album details</h2>
            <p className="manage-section__copy">Rename the album and keep its description aligned with the story you want to tell.</p>
          </div>
        </div>

        <div className="manage-card">
          <div className="manage-form">
            <label className="manage-field">
              <span>Title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} disabled={isBusy} />
            </label>

            <label className="manage-field">
              <span>Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                disabled={isBusy}
              />
            </label>
          </div>
        </div>

        <div className="manage-actions manage-actions--section">
          <div className="manage-actions__group">
            <button type="button" className="manage-button manage-button--primary" onClick={onSave} disabled={isBusy}>
              {saving ? "Saving..." : "Save album"}
            </button>
            <button type="button" className="manage-button manage-button--danger" onClick={onDelete} disabled={isBusy}>
              {deleting ? "Deleting..." : "Delete album"}
            </button>
          </div>
        </div>
      </section>

      <section className="manage-section">
        <div className="manage-section__header">
          <div>
            <h2 className="manage-section__title">Album order</h2>
            <p className="manage-section__copy">Drag photos to reorder them. New uploads are appended after the ordered photos when you save.</p>
          </div>
          <p className="manage-hero__meta">{orderedPhotoIds.length} in album</p>
        </div>

        {orderedPhotos.length === 0 ? (
          <div className="manage-card">
            <p className="manage-empty">This album is empty. Add photos from your library or upload new ones.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={orderedPhotoIds} strategy={rectSortingStrategy}>
              <div className="manage-sortable-grid">
                {orderedPhotos.map((photo) => (
                  <SortableAlbumPhotoCard
                    key={photo.id}
                    profileSlug={profileSlug}
                    photo={photo}
                    disabled={isBusy}
                    onRemove={() => togglePhoto(photo.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <div className="manage-actions manage-actions--section">
          <div className="manage-actions__group">
            <button type="button" className="manage-button manage-button--primary" onClick={onSave} disabled={isBusy}>
              {saving ? "Saving..." : "Save album"}
            </button>
          </div>
        </div>
      </section>

      <section className="manage-section">
        <div className="manage-section__header">
          <div>
            <h2 className="manage-section__title">Photo library</h2>
            <p className="manage-section__copy">Add existing profile photos to the album or remove them from the final order.</p>
          </div>
        </div>

        {allPhotos.length === 0 ? (
          <div className="manage-card">
            <p className="manage-empty">This profile does not have any photos yet.</p>
          </div>
        ) : (
          <div className="manage-library-grid">
            {allPhotos.map((photo) => {
              const isSelected = libraryPhotoIds.has(photo.id);

              return (
                <article className={`manage-library-card ${isSelected ? "is-selected" : ""}`} key={photo.id}>
                  <img
                    className="manage-library-card__image"
                    src={photoFileUrl(photo.id, profileSlug, "THUMB")}
                    alt={photo.title ?? ""}
                    loading="lazy"
                  />

                  <div>
                    <h3 className="manage-library-card__title">{photo.title?.trim() || "Untitled"}</h3>
                    <p className="manage-library-card__meta">{formatPhotoMeta(photo)}</p>
                    <p className="manage-library-card__date">Uploaded {formatDate(photo.createdAt)}</p>
                  </div>

                  <button
                    type="button"
                    className={`manage-button ${isSelected ? "manage-button--secondary" : "manage-button--ghost"}`}
                    onClick={() => togglePhoto(photo.id)}
                    disabled={isBusy}
                  >
                    {isSelected ? "In album" : "Add to album"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <PhotoUploadQueue drafts={drafts} onDraftsChange={setDrafts} disabled={isBusy} />

      {error && <p className="manage-status manage-status--error">{error}</p>}
      {success && <p className="manage-status manage-status--success">{success}</p>}

      <div className="manage-actions">
        <div className="manage-actions__group">
          <button type="button" className="manage-button manage-button--primary" onClick={onSave} disabled={isBusy}>
            {saving ? "Saving..." : "Save album"}
          </button>
        </div>

        <div className="manage-actions__group">
          <Link className="manage-button manage-button--ghost" to={`/${profileSlug}/album/${album.albumId}`}>
            View album
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ManageAlbumPage() {
  const { slug, albumId } = useParams();
  const profileSlug = normalizeSlug(slug);
  const location = useLocation();
  const navigate = useNavigate();
  const { session, isAuthenticated, loading: authLoading } = useAuth();
  const [albumListState, setAlbumListState] = useState<AlbumListState | null>(null);
  const [photoLibraryState, setPhotoLibraryState] = useState<PhotoLibraryState | null>(null);
  const [selectedAlbumState, setSelectedAlbumState] = useState<SelectedAlbumState | null>(null);
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [newAlbumDescription, setNewAlbumDescription] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const canManage = isAuthenticated && normalizeSlug(session.profileSlug) === profileSlug;
  const currentAlbumListState = albumListState?.slug === profileSlug ? albumListState : null;
  const currentPhotoLibraryState = photoLibraryState?.slug === profileSlug ? photoLibraryState : null;
  const currentSelectedAlbumState = albumId && selectedAlbumState?.albumId === albumId ? selectedAlbumState : null;
  const albums = currentAlbumListState?.albums ?? [];
  const albumListError = currentAlbumListState?.error ?? null;
  const photoLibraryError = currentPhotoLibraryState?.error ?? null;
  const allPhotos = currentPhotoLibraryState?.photos ?? [];
  const selectedAlbum = currentSelectedAlbumState?.album ?? null;
  const selectedAlbumError = currentSelectedAlbumState?.error ?? null;
  const albumListLoading = canManage && currentAlbumListState === null;
  const photoLibraryLoading = canManage && currentPhotoLibraryState === null;
  const selectedAlbumLoading = canManage && Boolean(albumId) && currentSelectedAlbumState === null;

  useEffect(() => {
    if (location.hash === "#new-album") {
      setIsCreateOpen(true);
    }
  }, [location.hash]);

  useEffect(() => {
    let cancelled = false;

    if (authLoading || !canManage || !profileSlug) {
      return () => {
        cancelled = true;
      };
    }

    fetchManageableAlbums(profileSlug)
      .then((nextAlbums) => {
        if (!cancelled) {
          setAlbumListState({ slug: profileSlug, albums: nextAlbums, error: null });
        }
      })
      .catch((caughtError) => {
        if (!cancelled) {
          setAlbumListState({
            slug: profileSlug,
            albums: [],
            error: readErrorMessage(caughtError, "Unable to load your albums."),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, canManage, profileSlug]);

  useEffect(() => {
    let cancelled = false;

    if (authLoading || !canManage || !profileSlug) {
      return () => {
        cancelled = true;
      };
    }

    fetchAllManageablePhotos(profileSlug)
      .then((nextPhotos) => {
        if (!cancelled) {
          setPhotoLibraryState({ slug: profileSlug, photos: nextPhotos, error: null });
        }
      })
      .catch((caughtError) => {
        if (!cancelled) {
          setPhotoLibraryState({
            slug: profileSlug,
            photos: [],
            error: readErrorMessage(caughtError, "Unable to load your photo library."),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, canManage, profileSlug]);

  useEffect(() => {
    if (!canManage || !currentAlbumListState) {
      return;
    }

    if (!albumId && currentAlbumListState.albums.length > 0 && location.hash !== "#new-album") {
      navigate(`/${profileSlug}/manage/albums/${currentAlbumListState.albums[0].albumId}`, { replace: true });
    }
  }, [albumId, canManage, currentAlbumListState, location.hash, navigate, profileSlug]);

  useEffect(() => {
    if (!canManage || !currentAlbumListState || !albumId) {
      return;
    }

    if (!currentAlbumListState.albums.some((albumSummary) => albumSummary.albumId === albumId)) {
      const fallbackAlbumId = currentAlbumListState.albums[0]?.albumId;
      navigate(fallbackAlbumId ? `/${profileSlug}/manage/albums/${fallbackAlbumId}` : `/${profileSlug}/manage/albums`, { replace: true });
    }
  }, [albumId, canManage, currentAlbumListState, navigate, profileSlug]);

  useEffect(() => {
    let cancelled = false;

    if (authLoading || !canManage || !albumId) {
      return () => {
        cancelled = true;
      };
    }

    fetchManagedAlbum(albumId)
      .then((nextAlbum) => {
        if (!cancelled) {
          setSelectedAlbumState({ albumId, album: nextAlbum, error: null });
        }
      })
      .catch((caughtError) => {
        if (!cancelled) {
          setSelectedAlbumState({
            albumId,
            album: null,
            error: readErrorMessage(caughtError, "Unable to load this album."),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [albumId, authLoading, canManage]);

  async function refreshAlbums() {
    const nextAlbums = await fetchManageableAlbums(profileSlug);
    setAlbumListState({ slug: profileSlug, albums: nextAlbums, error: null });
    return nextAlbums;
  }

  async function refreshPhotoLibrary() {
    const nextPhotos = await fetchAllManageablePhotos(profileSlug);
    setPhotoLibraryState({ slug: profileSlug, photos: nextPhotos, error: null });
    return nextPhotos;
  }

  async function refreshAlbum(targetAlbumId: string) {
    const nextAlbum = await fetchManagedAlbum(targetAlbumId);
    setSelectedAlbumState({ albumId: targetAlbumId, album: nextAlbum, error: null });
    return nextAlbum;
  }

  async function handleCreateAlbum() {
    const normalizedTitle = newAlbumTitle.trim();

    if (!normalizedTitle) {
      setCreateError("Album title is required.");
      return;
    }

    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const createdAlbum = await createManagedAlbum(profileSlug, {
        title: normalizedTitle,
        description: newAlbumDescription,
      });
      await refreshAlbums();
      setNewAlbumTitle("");
      setNewAlbumDescription("");
      setIsCreateOpen(false);
      setCreateSuccess(`Album "${createdAlbum.title}" created.`);
      navigate(`/${profileSlug}/manage/albums/${createdAlbum.id}`);
    } catch (caughtError) {
      setCreateError(readErrorMessage(caughtError, "Failed to create this album."));
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteAlbum(targetAlbumId: string) {
    await deleteManagedAlbum(targetAlbumId);

    const nextAlbums = await refreshAlbums();
    const nextSelectedAlbumId = nextAlbums[0]?.albumId;

    if (nextSelectedAlbumId) {
      navigate(`/${profileSlug}/manage/albums/${nextSelectedAlbumId}`, { replace: true });
      return;
    }

    navigate(`/${profileSlug}/manage/albums`, { replace: true });
  }

  const activeAlbumId = albumId ?? null;

  return (
    <div className="manage-panel">
      <header className="manage-hero manage-hero--panel">
        <p className="manage-hero__eyebrow">Album configuration</p>
        <h1 className="manage-hero__title">Manage your collections</h1>
      </header>

      {!authLoading && !canManage && (
        <p className="manage-status manage-status--error">This page is only available for your own main profile.</p>
      )}

      {(albumListLoading || photoLibraryLoading) && <p className="manage-empty">Loading collection workspace...</p>}

      {!authLoading && canManage && !albumListLoading && !photoLibraryLoading && (
        <div className="manage-workspace">
          <aside className="manage-sidebar">
              <Collapsible.Root open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <section className="manage-card" id="new-album">
                  <Collapsible.Trigger className="manage-collapsible-trigger">
                    <span className="manage-section__title">New collection</span>
                    <span className={`manage-collapsible-trigger__icon ${isCreateOpen ? "is-open" : ""}`}>▾</span>
                  </Collapsible.Trigger>

                  <Collapsible.Content className="manage-collapsible-content">
                    <p className="manage-section__copy">Create a fresh collection, then start ordering photos inside it.</p>

                    <div className="manage-form manage-form--compact">
                      <label className="manage-field">
                        <span>Title</span>
                        <input value={newAlbumTitle} onChange={(event) => setNewAlbumTitle(event.target.value)} disabled={creating} />
                      </label>

                      <label className="manage-field">
                        <span>Description</span>
                        <textarea
                          value={newAlbumDescription}
                          onChange={(event) => setNewAlbumDescription(event.target.value)}
                          rows={3}
                          disabled={creating}
                        />
                      </label>

                      <button type="button" className="manage-button manage-button--primary" onClick={handleCreateAlbum} disabled={creating}>
                        {creating ? "Creating..." : "Create album"}
                      </button>
                    </div>

                    {createError && <p className="manage-status manage-status--error">{createError}</p>}
                    {createSuccess && <p className="manage-status manage-status--success">{createSuccess}</p>}
                  </Collapsible.Content>
                </section>
              </Collapsible.Root>

            <section className="manage-card">
                <div className="manage-section__header">
                  <div>
                    <h2 className="manage-section__title">Albums</h2>
                    <p className="manage-section__copy">Choose a collection to manage and order its content.</p>
                  </div>
                  <p className="manage-hero__meta">{albums.length}</p>
                </div>

                {albumListError && <p className="manage-status manage-status--error">{albumListError}</p>}

                {albums.length === 0 ? (
                  <p className="manage-empty">No collections yet. Create your first one from the card above.</p>
                ) : (
                  <div className="manage-collection-list">
                    {albums.map((albumSummary) => {
                      const coverUrl = albumSummary.firstPhotoId
                        ? photoFileUrl(albumSummary.firstPhotoId, profileSlug, "THUMB")
                        : null;

                      return (
                        <button
                          key={albumSummary.albumId}
                          type="button"
                          className={`manage-album-list__item ${activeAlbumId === albumSummary.albumId ? "is-active" : ""}`}
                          onClick={() => navigate(`/${profileSlug}/manage/albums/${albumSummary.albumId}`)}
                        >
                          {coverUrl ? (
                            <img className="manage-album-list__thumb" src={coverUrl} alt={albumSummary.title} loading="lazy" />
                          ) : (
                            <div className="manage-album-list__thumb manage-album-list__thumb--empty">No cover</div>
                          )}

                          <div className="manage-album-list__body">
                            <h3 className="manage-album-list__title">{albumSummary.title}</h3>
                            <p className="manage-album-list__meta">{albumSummary.numberOfPhotos} photo{albumSummary.numberOfPhotos === 1 ? "" : "s"}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
            </section>

          </aside>

          {photoLibraryError && <p className="manage-status manage-status--error">{photoLibraryError}</p>}

          {selectedAlbumLoading ? (
            <div className="manage-card manage-detail">
              <p className="manage-empty">Loading collection editor...</p>
            </div>
          ) : selectedAlbumError ? (
            <div className="manage-card manage-detail">
              <p className="manage-status manage-status--error">{selectedAlbumError}</p>
            </div>
          ) : selectedAlbum ? (
            <AlbumEditorPanel
              key={selectedAlbum.albumId}
              profileSlug={profileSlug}
              album={selectedAlbum}
              allPhotos={allPhotos}
              onRefreshAlbums={refreshAlbums}
              onRefreshAlbum={refreshAlbum}
              onRefreshPhotoLibrary={refreshPhotoLibrary}
              onDeleteAlbum={handleDeleteAlbum}
            />
          ) : (
            <div className="manage-card manage-detail">
              <p className="manage-empty">Select a collection from the left or create a new one!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
