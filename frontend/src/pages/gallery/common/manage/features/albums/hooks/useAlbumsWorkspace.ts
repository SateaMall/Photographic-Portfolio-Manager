import { useEffect, useState } from "react";
import type { NavigateFunction } from "react-router-dom";

import {
  createManagedAlbum,
  deleteManagedAlbum,
  fetchAllManageablePhotos,
  fetchManageableAlbums,
  fetchManagedAlbum,
} from "../../../../../../../api/manage";
import type { AlbumViewResponse, ManagedAlbumResponse, ManagedPhotoResponse } from "../../../../../../../types/types";
import { readErrorMessage } from "../../../shared/utils/manageErrors";
import { getManageAlbumPath } from "../../../shared/utils/manageRoute";

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

type UseAlbumsWorkspaceProps = {
  profileSlug: string;
  albumId?: string;
  locationHash: string;
  canManage: boolean;
  authLoading: boolean;
  navigate: NavigateFunction;
};

export function useAlbumsWorkspace({ profileSlug, albumId, locationHash, canManage, authLoading, navigate }: UseAlbumsWorkspaceProps) {
  const [albumListState, setAlbumListState] = useState<AlbumListState | null>(null);
  const [photoLibraryState, setPhotoLibraryState] = useState<PhotoLibraryState | null>(null);
  const [selectedAlbumState, setSelectedAlbumState] = useState<SelectedAlbumState | null>(null);
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [newAlbumDescription, setNewAlbumDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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
  const isCreateOpen = locationHash === "#new-album";
  const activeAlbumId = albumId ?? null;

  useEffect(() => {
    if (!isCreateOpen) {
      setCreateError(null);
    }
  }, [isCreateOpen]);

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

    if (!albumId && currentAlbumListState.albums.length > 0 && locationHash !== "#new-album") {
      navigate(getManageAlbumPath(profileSlug, currentAlbumListState.albums[0].albumId), { replace: true });
    }
  }, [albumId, canManage, currentAlbumListState, locationHash, navigate, profileSlug]);

  useEffect(() => {
    if (!canManage || !currentAlbumListState || !albumId) {
      return;
    }

    if (!currentAlbumListState.albums.some((albumSummary) => albumSummary.albumId === albumId)) {
      const fallbackAlbumId = currentAlbumListState.albums[0]?.albumId;
      navigate(getManageAlbumPath(profileSlug, fallbackAlbumId), { replace: true });
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

    try {
      const createdAlbum = await createManagedAlbum(profileSlug, {
        title: normalizedTitle,
        description: newAlbumDescription,
      });
      await refreshAlbums();
      setNewAlbumTitle("");
      setNewAlbumDescription("");
      navigate(getManageAlbumPath(profileSlug, createdAlbum.id));
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
    navigate(getManageAlbumPath(profileSlug, nextSelectedAlbumId), { replace: true });
  }

  return {
    activeAlbumId,
    albumListError,
    albumListLoading,
    albums,
    allPhotos,
    createError,
    creating,
    handleCreateAlbum,
    handleDeleteAlbum,
    isCreateOpen,
    newAlbumDescription,
    newAlbumTitle,
    photoLibraryError,
    photoLibraryLoading,
    refreshAlbum,
    refreshAlbums,
    refreshPhotoLibrary,
    selectedAlbum,
    selectedAlbumError,
    selectedAlbumLoading,
    setNewAlbumDescription,
    setNewAlbumTitle,
  };
}
