package com.letmelens.backend.service;

import com.letmelens.backend.dto.ForgotPasswordRequest;
import com.letmelens.backend.dto.ResetPasswordRequest;
import com.letmelens.backend.exception.TooManyPasswordResetRequestsException;
import com.letmelens.backend.model.user.AppUser;
import com.letmelens.backend.model.user.PasswordResetToken;
import com.letmelens.backend.repo.AppUserRepository;
import com.letmelens.backend.repo.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(60);
    private static final Duration RESEND_WINDOW = Duration.ofHours(1);
    private static final int MAX_RESET_EMAILS_PER_WINDOW = 6;

    private final AppUserRepository appUserRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        AppUser user = appUserRepository.findByEmail(normalize(request.email()))
                .orElse(null);
        if (user == null || !user.isEnabled()) {
            return;
        }

        assertResendAllowed(user);

        String rawToken = generateToken();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .tokenHash(hashToken(rawToken))
                .expiresAt(Instant.now().plus(30, ChronoUnit.MINUTES))
                .build();

        passwordResetTokenRepository.save(resetToken);
        sendResetEmail(user, rawToken);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String normalizedToken = request.token().trim();
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findTopByTokenHashAndUsedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(
                        hashToken(normalizedToken),
                        Instant.now()
                )
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset link."));

        AppUser user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword().trim()));
        resetToken.setUsedAt(Instant.now());

        appUserRepository.save(user);
        passwordResetTokenRepository.deleteByUser_Id(user.getId());
    }

    private void sendResetEmail(AppUser user, String rawToken) {
        String resetUrl = buildResetUrl(rawToken);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Reset your password");
        message.setText(
                "Hello " + safe(user.getFirstName()) + ",\n\n"
                        + "We received a request to reset your password.\n\n"
                        + "Open this link to choose a new password:\n"
                        + resetUrl + "\n\n"
                        + "This link expires in 30 minutes and can only be used once.\n\n"
                        + "If you did not request this, you can ignore this email."
        );

        mailSender.send(message);
    }

    private void assertResendAllowed(AppUser user) {
        Instant now = Instant.now();

        passwordResetTokenRepository.findTopByUser_IdOrderByCreatedAtDesc(user.getId())
                .map(PasswordResetToken::getCreatedAt)
                .ifPresent(lastSentAt -> {
                    Duration remainingCooldown = Duration.between(now, lastSentAt.plus(RESEND_COOLDOWN));
                    if (!remainingCooldown.isNegative() && !remainingCooldown.isZero()) {
                        throw new TooManyPasswordResetRequestsException(
                                "Please wait " + formatWait(remainingCooldown) + " before requesting another reset link."
                        );
                    }
                });

        Instant windowStart = now.minus(RESEND_WINDOW);
        long resetEmailsInWindow = passwordResetTokenRepository.countByUser_IdAndCreatedAtAfter(user.getId(), windowStart);
        if (resetEmailsInWindow < MAX_RESET_EMAILS_PER_WINDOW) {
            return;
        }

        Duration remainingWindow = passwordResetTokenRepository
                .findFirstByUser_IdAndCreatedAtAfterOrderByCreatedAtAsc(user.getId(), windowStart)
                .map(PasswordResetToken::getCreatedAt)
                .map(firstSentAt -> Duration.between(now, firstSentAt.plus(RESEND_WINDOW)))
                .orElse(RESEND_WINDOW);

        throw new TooManyPasswordResetRequestsException(
                "Too many reset link requests for this email. Please try again in " + formatWait(remainingWindow) + "."
        );
    }

    private String buildResetUrl(String rawToken) {
        String normalizedBaseUrl = frontendBaseUrl.endsWith("/")
                ? frontendBaseUrl.substring(0, frontendBaseUrl.length() - 1)
                : frontendBaseUrl;
        return normalizedBaseUrl + "/reset-password?token=" + rawToken;
    }

    private String generateToken() {
        byte[] tokenBytes = new byte[32];
        RANDOM.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available.", exception);
        }
    }

    private String normalize(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private String formatWait(Duration duration) {
        long totalSeconds = Math.max(1, duration.toSeconds());

        if (totalSeconds < 60) {
            return totalSeconds + (totalSeconds == 1 ? " second" : " seconds");
        }

        long roundedMinutes = Math.max(1, (totalSeconds + 59) / 60);
        if (roundedMinutes < 60) {
            return roundedMinutes + (roundedMinutes == 1 ? " minute" : " minutes");
        }

        long hours = roundedMinutes / 60;
        long minutes = roundedMinutes % 60;

        if (minutes == 0) {
            return hours + (hours == 1 ? " hour" : " hours");
        }

        return hours + (hours == 1 ? " hour" : " hours") + " and "
                + minutes + (minutes == 1 ? " minute" : " minutes");
    }
}
