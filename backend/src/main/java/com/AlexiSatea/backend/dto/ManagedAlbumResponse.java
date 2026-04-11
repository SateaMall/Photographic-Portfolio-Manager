package com.AlexiSatea.backend.dto;

import com.AlexiSatea.backend.model.album.Album;

import java.util.List;
import java.util.UUID;

public record ManagedAlbumResponse(
        UUID albumId,
        String title,
        String description,
        List<ManagedPhotoResponse> photos
) {
    public static ManagedAlbumResponse from(Album album, List<ManagedPhotoResponse> photos) {
        return new ManagedAlbumResponse(
                album.getId(),
                album.getTitle(),
                album.getDescription(),
                photos
        );
    }
}
