package com.AlexiSatea.backend.repo;

import com.AlexiSatea.backend.model.user.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AppUserRepository extends JpaRepository<AppUser, UUID> {

    Optional<AppUser> findByEmail(String email);
    boolean existsByEmail(String email);
}