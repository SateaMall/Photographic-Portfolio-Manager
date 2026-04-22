package com.letmelens.backend.model.album;

import com.letmelens.backend.model.profile.Profile;
import com.letmelens.backend.model.user.AppUser;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "albums",
        uniqueConstraints = {
        @UniqueConstraint(name = "uk_album_profile_title", columnNames = {"owner_profile_id", "title"})
        },
        indexes = {
        @Index(name = "idx_albums_profile_public", columnList = "owner_profile_id, is_public"),
        @Index(name = "idx_albums_created_by", columnList = "created_by_user_id"),
        @Index(name = "idx_albums_created_at", columnList = "created_at")
})
public class Album {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // which profile this album belongs to (Satea/Alexis/Shared are rows)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_profile_id", nullable = false)
    private Profile ownerProfile;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private AppUser createdBy;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 2000)
    private String description;

    @Builder.Default
    @OneToMany(mappedBy = "album", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<AlbumPhoto> photoLinks = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private boolean isPublic = true;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        normalize();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
        normalize();
    }

    private void normalize() {
        if (title != null) title = title.trim();
        if (description != null) description = description.trim();
    }
}
