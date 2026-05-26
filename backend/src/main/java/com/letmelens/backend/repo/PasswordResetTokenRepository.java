package com.letmelens.backend.repo;

import com.letmelens.backend.model.user.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findTopByTokenHashAndUsedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(
            String tokenHash,
            Instant now
    );

    Optional<PasswordResetToken> findTopByUser_IdOrderByCreatedAtDesc(UUID userId);

    Optional<PasswordResetToken> findFirstByUser_IdAndCreatedAtAfterOrderByCreatedAtAsc(UUID userId, Instant createdAt);

    long countByUser_IdAndCreatedAtAfter(UUID userId, Instant createdAt);

    void deleteByUser_Id(UUID userId);
}
