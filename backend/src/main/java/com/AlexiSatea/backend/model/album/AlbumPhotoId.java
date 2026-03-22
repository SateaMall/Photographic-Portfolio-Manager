package com.AlexiSatea.backend.model.album;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class AlbumPhotoId implements Serializable {
    @Column(name = "album_id", nullable = false)
    private UUID albumId;

    @Column(name = "photo_id", nullable = false)
    private UUID photoId;

}
