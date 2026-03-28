package com.AlexiSatea.backend.service;


import com.AlexiSatea.backend.dto.VerifyEmailRequest;
import com.AlexiSatea.backend.model.user.AppUser;
import com.AlexiSatea.backend.model.user.EmailVerificationCode;
import com.AlexiSatea.backend.repo.AppUserRepository;
import com.AlexiSatea.backend.repo.EmailVerificationCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private static final SecureRandom RANDOM = new SecureRandom();

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

        createAndSendVerificationCode(user);
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
}