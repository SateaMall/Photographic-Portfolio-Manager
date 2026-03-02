package com.AlexiSatea.backend.dto;


import com.AlexiSatea.backend.model.Enum.Owner;
import com.AlexiSatea.backend.model.photo.Photo;
import com.AlexiSatea.backend.model.photo.feature.PhotoFeature;

import java.time.Instant;
import java.util.UUID;

public record PhotoResponse(
        UUID id,
        Owner owner,
        Instant createdAt,
        String title,
        String description,
        String country,
        String city,
        Integer captureYear

) {

    public static PhotoResponse from(Photo p) {
        return new PhotoResponse(
                p.getId(),
                p.getOwner(),
                p.getCreatedAt(),
                p.getTitle(),
                p.getDescription(),
                p.getCountry(),
                p.getCity(),
                p.getCaptureYear()
        );
    }

    //For multiple photos (homepage)
    public static PhotoResponse from(Photo p, PhotoFeature pf) {
        return new PhotoResponse(
                p.getId(),
                p.getOwner(),
                p.getCreatedAt(),
                p.getTitle(),
                p.getDescription(),
                p.getCountry(),
                p.getCity(),
                p.getCaptureYear()
        );
    }
}
