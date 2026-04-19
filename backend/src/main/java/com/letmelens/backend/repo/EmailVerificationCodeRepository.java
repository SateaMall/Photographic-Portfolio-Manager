package com.letmelens.backend.repo;

import com.letmelens.backend.model.user.EmailVerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationCodeRepository extends JpaRepository<EmailVerificationCode, UUID> {

    Optional<EmailVerificationCode> findTopByUser_IdAndUsedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(
            UUID userId,
            Instant now
    );

    Optional<EmailVerificationCode> findTopByUser_IdOrderByCreatedAtDesc(UUID userId);

    Optional<EmailVerificationCode> findFirstByUser_IdAndCreatedAtAfterOrderByCreatedAtAsc(UUID userId, Instant createdAt);

    long countByUser_IdAndCreatedAtAfter(UUID userId, Instant createdAt);

    void deleteByUser_Id(UUID userId);
}
