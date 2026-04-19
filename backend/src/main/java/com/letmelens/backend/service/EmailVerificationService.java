package com.letmelens.backend.service;


import com.letmelens.backend.dto.VerifyEmailRequest;
import com.letmelens.backend.exception.TooManyVerificationCodeRequestsException;
import com.letmelens.backend.model.user.AppUser;
import com.letmelens.backend.model.user.EmailVerificationCode;
import com.letmelens.backend.repo.AppUserRepository;
import com.letmelens.backend.repo.EmailVerificationCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(60);
    private static final Duration RESEND_WINDOW = Duration.ofHours(1);
    private static final int MAX_VERIFICATION_EMAILS_PER_WINDOW = 6;

    private final EmailVerificationCodeRepository emailVerificationCodeRepository;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Transactional
    public void createAndSendVerificationCode(AppUser user) {
        String rawCode = generateCode();

        EmailVerificationCode verificationCode = EmailVerificationCode.builder()
                .user(user)
                .codeHash(passwordEncoder.encode(rawCode))
                .expiresAt(Instant.now().plus(15, ChronoUnit.MINUTES))
                .build();

        emailVerificationCodeRepository.save(verificationCode);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Verify your email");
        message.setText(
                "Hello " + safe(user.getFirstName()) + ",\n\n" +
                        "Your verification code is: " + rawCode + "\n\n" +
                        "This code expires in 15 minutes."
        );

        mailSender.send(message);
    }

    @Transactional
    public void verifyEmail(VerifyEmailRequest request) {
        String email = normalize(request.email());

        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.isEnabled() && user.getEmailVerifiedAt() != null) {
            return;
        }

        EmailVerificationCode verificationCode = emailVerificationCodeRepository
                .findTopByUser_IdAndUsedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(
                        user.getId(),
                        Instant.now()
                )
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification code"));

        if (!passwordEncoder.matches(request.code().trim(), verificationCode.getCodeHash())) {
            throw new IllegalArgumentException("Invalid or expired verification code");
        }

        verificationCode.setUsedAt(Instant.now());
        user.setEnabled(true);
        user.setEmailVerifiedAt(Instant.now());

        appUserRepository.save(user);
        emailVerificationCodeRepository.deleteByUser_Id(user.getId());
    }

    @Transactional
    public void resendVerificationCode(String email) {
        AppUser user = appUserRepository.findByEmail(normalize(email))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.isEnabled()) {
            return;
        }

        assertResendAllowed(user);
        createAndSendVerificationCode(user);
    }

    private void assertResendAllowed(AppUser user) {
        Instant now = Instant.now();

        emailVerificationCodeRepository.findTopByUser_IdOrderByCreatedAtDesc(user.getId())
                .map(EmailVerificationCode::getCreatedAt)
                .ifPresent(lastSentAt -> {
                    Duration remainingCooldown = Duration.between(now, lastSentAt.plus(RESEND_COOLDOWN));
                    if (!remainingCooldown.isNegative() && !remainingCooldown.isZero()) {
                        throw new TooManyVerificationCodeRequestsException(
                                "Please wait " + formatWait(remainingCooldown) + " before requesting another verification code."
                        );
                    }
                });

        Instant windowStart = now.minus(RESEND_WINDOW);
        long verificationEmailsInWindow = emailVerificationCodeRepository.countByUser_IdAndCreatedAtAfter(user.getId(), windowStart);
        if (verificationEmailsInWindow < MAX_VERIFICATION_EMAILS_PER_WINDOW) {
            return;
        }

        Duration remainingWindow = emailVerificationCodeRepository
                .findFirstByUser_IdAndCreatedAtAfterOrderByCreatedAtAsc(user.getId(), windowStart)
                .map(EmailVerificationCode::getCreatedAt)
                .map(firstSentAt -> Duration.between(now, firstSentAt.plus(RESEND_WINDOW)))
                .orElse(RESEND_WINDOW);

        throw new TooManyVerificationCodeRequestsException(
                "Too many verification code requests for this email. Please try again in " + formatWait(remainingWindow) + "."
        );
    }

    private String generateCode() {
        int value = 1000 + RANDOM.nextInt(9000);
        return String.valueOf(value);
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
