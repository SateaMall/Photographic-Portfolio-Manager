package com.AlexiSatea.backend.repo;

import com.AlexiSatea.backend.model.user.ProfileUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProfileUserRepository extends JpaRepository<ProfileUser, UUID> {
    boolean existsByProfile_IdAndUser_Id(UUID profileId, UUID userId);
}
