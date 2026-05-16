package com.letmelens.backend.repo;

import com.letmelens.backend.model.user.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AppUserRepository extends JpaRepository<AppUser, UUID> {

    Optional<AppUser> findByEmail(String email);
    Optional<AppUser> findByGoogleSubject(String googleSubject);
    boolean existsByEmail(String email);
}
