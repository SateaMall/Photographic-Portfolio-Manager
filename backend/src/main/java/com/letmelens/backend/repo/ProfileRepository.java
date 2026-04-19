package com.letmelens.backend.repo;

import com.letmelens.backend.model.profile.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository  extends JpaRepository<Profile, UUID> {
    Optional<Profile> findBySlug(String slug);
    Optional<Profile> findBySlugAndIsPublicTrue(String slug);
    boolean existsBySlug(String slug);
    Optional<Profile> findFirstByMemberships_User_IdOrderByCreatedAtAsc(UUID userId);
    List<Profile> findAllByMemberships_User_Id(UUID userId);

    Optional<Profile> findBySlugAndMemberships_User_Id(String slug, UUID userId);
}
