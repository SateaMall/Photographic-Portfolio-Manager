package com.AlexiSatea.backend.model.profile;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(name = "profiles",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_profiles_slug", columnNames = "slug")
        },
        indexes = {
                @Index(name = "idx_profiles_slug", columnList = "slug")
        }
)
public class Profile {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    // URL-friendly name: satea / alexis / shared
    @Column(nullable = false, length = 80)
    private String slug;

    @Column(name = "display_name", nullable = false, length = 120)
    private String displayName;

    @Column(length = 2000)
    private String bio;

    // Branding colors (hex strings)
    @Size(max = 16)
    @Column(name = "primary_color", length = 16)
    private String primaryColor;

    @Size(max = 16)
    @Column(name = "secondary_color", length = 16)
    private String secondaryColor;

    @Builder.Default
    @Column(name = "is_public", nullable = false)
    private boolean isPublic = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Builder.Default
    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProfileUser> memberships = new ArrayList<>();

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
        if (slug != null) slug = slug.trim().toLowerCase();
        if (displayName != null) displayName = displayName.trim();
        if (primaryColor != null) primaryColor = primaryColor.trim();
        if (secondaryColor != null) secondaryColor = secondaryColor.trim();
    }
}