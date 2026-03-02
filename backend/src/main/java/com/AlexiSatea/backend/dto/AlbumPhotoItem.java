package com.AlexiSatea.backend.dto;

import com.AlexiSatea.backend.model.Enum.Owner;
import com.AlexiSatea.backend.model.album.AlbumPhoto;
import com.AlexiSatea.backend.model.photo.Photo;
import org.springframework.data.domain.Page;

import java.time.Instant;
import java.util.UUID;

public record AlbumPhotoItem(
        UUID photoId,
        Owner owner,
        String title,
        String description,
        String country,
        String city,
        Integer captureYear,
        Instant addedAt,
        Integer width,
        Integer height
) {
    public static AlbumPhotoItem from(AlbumPhoto ap) {
        Photo p = ap.getPhoto();
        return new AlbumPhotoItem(
                p.getId(),
                p.getOwner(),
                p.getTitle(),
                p.getDescription(),
                p.getCountry(),
                p.getCity(),
                p.getCaptureYear(),
                ap.getAddedAt(),
                p.getWidth(),
                p.getHeight()
        );
    }

    public static Page<AlbumPhotoItem> from(Page<AlbumPhoto> relations) {
        return relations.map(ap -> {
            Photo photo = ap.getPhoto();
            return new AlbumPhotoItem(
                    photo.getId(),
                    photo.getOwner(),
                    photo.getTitle(),
                    photo.getDescription(),
                    photo.getCountry(),
                    photo.getCity(),
                    photo.getCaptureYear(),
                    ap.getAddedAt(),
                    photo.getWidth(),
                    photo.getHeight()
            );
        });
    }
}