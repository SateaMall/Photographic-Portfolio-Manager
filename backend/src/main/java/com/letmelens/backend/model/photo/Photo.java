package com.letmelens.backend.model.photo;

import com.letmelens.backend.model.album.AlbumPhoto;
import com.letmelens.backend.model.user.AppUser;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(name = "photos",
        indexes = {
                @Index(name = "idx_photos_author", columnList = "author_user_id"),
                @Index(name = "idx_photos_created_at", columnList = "created_at"),
                @Index(name = "idx_photos_country_city", columnList = "country, city")
        }
)
public class Photo {
// ID is created later
    @Id
    private UUID id;

    // who uploaded / owns the file record
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_user_id", nullable = false)
    private AppUser author;

    // ---- Original (as uploaded) ----

    /**
     * Path/key to original file (as uploaded).
     * Example: owner/Satea/2026/01/<uuid>_org.jpg
     */
    @Column(nullable = false, unique = true, length = 500)
    private String originalKey;

    @Column(nullable = false, length = 255)
    private String originalFilename;

    /**
     * MIME type, e.g. image/jpeg, image/png
     */
    @Column(nullable = false, length = 100)
    private String originalContentType;

    @Column(nullable = false)
    private long originalSizeBytes;


    // ---- Derivatives ----

    /**
     * Medium quality variant (homepage / normal viewing)
     * Example: owner/Satea/2026/01/<uuid>_md.jpg
     */
    @Column(nullable = false, length = 500)
    private String mediumKey;

    @Column(nullable = false, length = 100)
    private String mediumContentType; // usually image/jpeg or image/webp

    @Column(nullable = false)
    private long mediumSizeBytes;

    /**
     * Thumbnail / low quality (grids / side strip)
     * Example: owner/Satea/2026/01/<uuid>_th.jpg
     */
    @Column(nullable = false, length = 500)
    private String thumbKey;

    @Column(nullable = false, length = 100)
    private String thumbContentType;

    @Column(nullable = false)
    private long thumbSizeBytes;


    // ---- Display metadata ----

    @Column(nullable = true, length = 150)
    private String title;


    @Column(nullable = true, length = 2000)
    private String description;

    @Column(nullable = true)
    private String country;

    @Column(nullable = true)
    private String city;

    @Column(nullable = true)
    @Min(1800)
    @Max(2100)
    private Integer captureYear;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(nullable = false)
    private Integer width;   // original width

    @Column(nullable = false)
    private Integer height;  // original height

    @Builder.Default
    @OneToMany(mappedBy = "photo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AlbumPhoto> albumLinks = new ArrayList<>();


    @Builder.Default
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "photo_themes",
            joinColumns = @JoinColumn(name = "photo_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"photo_id", "theme"})
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "theme", nullable = false, length = 50)
    private List<Theme> themes = new ArrayList<>();



    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        this.city = normalizeCity(this.city);
        this.country = normalizeCountryCode(this.country);

    }


    @PreUpdate
    private void OnModification() {
        updatedAt = Instant.now();
        this.city = normalizeCity(this.city);
        this.country = normalizeCountryCode(this.country);
    }

    // Make city Lower case and deletes spaces
    private static String normalizeCity(String city) {
        if (city == null) return null;
        city = city.trim().replaceAll("\\s+", " ");
        if (city.isEmpty()) return null;
        String lower = city.toLowerCase(Locale.ROOT);
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }

    // Make Counrty Codes uppercase
    private static String normalizeCountryCode(String code) {
        if (code == null) return null;
        code = code.trim().toUpperCase(Locale.ROOT);
        return code.isEmpty() ? null : code;
    }

}
