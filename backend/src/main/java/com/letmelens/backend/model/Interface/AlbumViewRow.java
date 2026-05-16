package com.letmelens.backend.model.Interface;

import java.util.UUID;

public interface AlbumViewRow {
UUID getAlbumId();
UUID getFirstPhotoId();
String getTitle();
String getDescription();
Integer getNumberOfPhotos();
}
