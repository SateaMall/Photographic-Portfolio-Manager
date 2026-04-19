package com.letmelens.backend.dto;

import com.letmelens.backend.model.photo.Photo;

import java.time.Instant;
import java.util.UUID;

public record ManagedPhotoResponse(
        UUID id,
        Instant createdAt,
        String title,
        String description,
        String country,
        String city,
        Integer captureYear
) {
    public static ManagedPhotoResponse from(Photo photo) {
        return new ManagedPhotoResponse(
                photo.getId(),
                photo.getCreatedAt(),
                photo.getTitle(),
                photo.getDescription(),
                photo.getCountry(),
                photo.getCity(),
                photo.getCaptureYear()
        );
    }
}
