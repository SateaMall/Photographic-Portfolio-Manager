package com.AlexiSatea.backend.dto;

import com.AlexiSatea.backend.model.album.Album;

import java.util.UUID;

public record AlbumResponse(
        UUID id,
        String title,
        String description

) {
    public static AlbumResponse from(Album album) {
        return new AlbumResponse(
                album.getId(),
                album.getTitle(),
                album.getDescription()
        );
    }
    public static AlbumResponse from (UUID id, String title, String description) {
        return new AlbumResponse(
                id,
                title,
                description
        );
    }
}