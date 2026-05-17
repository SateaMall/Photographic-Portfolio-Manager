package com.letmelens.backend.dto;

import com.letmelens.backend.model.photo.Photo;
import com.letmelens.backend.model.photo.feature.PhotoFeature;

import java.time.Instant;
import java.util.UUID;

public record PhotoResponse(
        UUID id,
        Instant createdAt,
        String title,
        String description,
        String country,
        String city,
        Integer captureYear,
        Integer width,
        Integer height

) {
    public static PhotoResponse from(Photo p) {
        return new PhotoResponse(
                p.getId(),
                p.getCreatedAt(),
                p.getTitle(),
                p.getDescription(),
                p.getCountry(),
                p.getCity(),
                p.getCaptureYear(),
                p.getWidth(),
                p.getHeight()
        );
    }

    //For multiple photos (homepage)
    public static PhotoResponse from(Photo p, PhotoFeature pf) {
        return new PhotoResponse(
                p.getId(),
                p.getCreatedAt(),
                p.getTitle(),
                p.getDescription(),
                p.getCountry(),
                p.getCity(),
                p.getCaptureYear(),
                p.getWidth(),
                p.getHeight()
        );
    }
}
