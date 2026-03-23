package com.AlexiSatea.backend.model.user;

import com.AlexiSatea.backend.model.profile.Profile;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(name = "profile_user",
        indexes = {
                @Index(name = "idx_profile_user_profile", columnList = "profile_id"),
                @Index(name = "idx_profile_user_user_profile", columnList= "user_id, profile_id"),
                @Index(name = "idx_profile_user_user", columnList = "user_id"),
                @Index(name = "idx_profile_user_role", columnList = "role")
        }
)
public class ProfileUser {

    @EmbeddedId
    @Builder.Default
    private ProfileUserId id = new ProfileUserId();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("profileId")
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "added_at", nullable = false, updatable = false)
    private Instant addedAt;

    @PrePersist
    void onCreate() {
        if (addedAt == null) addedAt = Instant.now();
    }
}