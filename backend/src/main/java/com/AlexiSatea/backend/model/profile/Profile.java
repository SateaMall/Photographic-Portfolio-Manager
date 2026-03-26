package com.AlexiSatea.backend.model.profile;

import com.AlexiSatea.backend.model.user.AppUser;
import com.AlexiSatea.backend.model.user.ProfileUser;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
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

    // Public/social fields (as you requested)
    @Email
    @Column(name = "public_email", length = 255)
    private String publicEmail;

    @Size(max = 300)
    @Column(name = "linkedin", length = 300)
    private String linkedIn;

    @Size(max = 300)
    @Column(name = "instagram", length = 300)
    private String instagram;

    @Pattern(
            regexp = "^\\+?[1-9]\\d{1,14}$",
            message = "Phone number must be a valid international format"
    )
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

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
        if (publicEmail != null) publicEmail = publicEmail.trim().toLowerCase();
        if (linkedIn != null) linkedIn = linkedIn.trim();
        if (instagram != null) instagram = instagram.trim();
    }

    //Can trigger lazy loading, try using a query instead
    public boolean isManagedBy(AppUser user) {
        if (user == null || user.getId() == null) {
            return false;
        }

        return memberships.stream()
                .map(ProfileUser::getUser)
                .filter(Objects::nonNull)
                .map(AppUser::getId)
                .anyMatch(user.getId()::equals);
    }


}