export function getGalleryPath(profileSlug: string) {
  return `/${profileSlug}`;
}

export function getManageBasePath(profileSlug: string) {
  return `/${profileSlug}/manage`;
}

export function getManageAlbumPath(profileSlug: string, albumId?: string) {
  return albumId ? `${getManageBasePath(profileSlug)}/albums/${albumId}` : `${getManageBasePath(profileSlug)}/albums`;
}

export function getPublicAlbumPath(profileSlug: string, albumId: string) {
  return `/${profileSlug}/album/${albumId}`;
}
