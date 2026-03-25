package com.AlexiSatea.backend.model.photo.feature;

import com.AlexiSatea.backend.model.photo.Photo;
import com.AlexiSatea.backend.model.profile.Profile;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "photo_feature",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_photo_feature_profile_type_photo",
                        columnNames = {"profile_id", "type", "photo_id"}
                )
        },
        indexes = {
                @Index(name = "idx_photo_feature_profile_type_enabled", columnList = "profile_id, type, enabled"),
                @Index(name = "idx_photo_feature_profile_type_order", columnList = "profile_id, type, order_index"),
                @Index(name = "idx_photo_feature_profile_type_featured_at", columnList = "profile_id, type, featured_at")
        }
)
public class PhotoFeature {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "photo_id", nullable = false)
    private Photo photo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private PhotoFeatureType type;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "order_index")
    private Integer orderIndex; // nullable = auto order

    @Column(name = "featured_at", nullable = false)
    private Instant featuredAt;


    @PrePersist
    void onCreate() {
        if (featuredAt == null) featuredAt = Instant.now();
    }
    @PreUpdate
    void onUpdate() {
        featuredAt = Instant.now();
    }
}