package com.AlexiSatea.backend.dto;

import com.AlexiSatea.backend.model.photo.Theme;
import com.AlexiSatea.backend.model.photo.Photo;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public record MainPhotoResponse(
            UUID id,
            String name,
            Instant createdAt,
            String title,
            String description,
            String country,
            String city,
            Integer captureYear,
            List<Theme> themes,
            Integer width,
            Integer height
//TODO Correct
    ) {
        //For single photo (photo's page)
        public static MainPhotoResponse from(Photo p) {
            return new MainPhotoResponse(
                    p.getId(),
                    "Satea",
                    p.getCreatedAt(),
                    p.getTitle(),
                    p.getDescription(),
                    p.getCountry(),
                    p.getCity(),
                    p.getCaptureYear(),
                    new ArrayList<>(p.getThemes()),
                    p.getWidth(),
                    p.getHeight()
                    );
        }


}
