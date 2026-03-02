package com.AlexiSatea.backend.model.album;

import com.AlexiSatea.backend.model.photo.Photo;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "album_photos",
        uniqueConstraints = @UniqueConstraint(columnNames = {"album_id", "photo_id"}))
public class AlbumPhoto {
    @EmbeddedId
    @Builder.Default
    private AlbumPhotoId id = new AlbumPhotoId();

    //fetchtype.lazy won't load the album or the photo each time we load the object album_photos,
    // It will load it only when we ask it too with getphoto() or getalbum(),
    // Important for performance!
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("albumId") // This will stock the albumId in SQL and not the instance!
    @JoinColumn(name = "album_id", nullable = false)
    private Album album;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("photoId")
    @JoinColumn(name = "photo_id", nullable = false)
    private Photo photo;

    @Column(nullable = false)
    private int position; // ordering inside album (optional but useful)

    @Column(name = "added_at", nullable = false, updatable = false)
    private Instant addedAt;


    @PrePersist
    void onAdd() {
        if (addedAt == null) addedAt = Instant.now();
    }
}


