package com.AlexiSatea.backend.repo;

import com.AlexiSatea.backend.model.profile.Profile;
import com.AlexiSatea.backend.model.user.ProfileUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository  extends JpaRepository<Profile, UUID> {
    Optional<Profile> findBySlug(String slug);
}
