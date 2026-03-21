package com.AlexiSatea.backend.service;

import com.AlexiSatea.backend.controller.AuthController;
import com.AlexiSatea.backend.dto.LoginRequest;
import com.AlexiSatea.backend.dto.SignupRequest;
import com.AlexiSatea.backend.model.profile.Profile;
import com.AlexiSatea.backend.model.profile.ProfileRole;
import com.AlexiSatea.backend.model.user.AppUser;
import com.AlexiSatea.backend.model.user.ProfileUser;
import com.AlexiSatea.backend.model.user.UserRole;
import com.AlexiSatea.backend.repo.AppUserRepository;
import com.AlexiSatea.backend.repo.ProfileRepository;
import com.AlexiSatea.backend.repo.ProfileUserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final AppUserRepository appUserRepository;
    private final ProfileRepository profileRepository;
    private final ProfileUserRepository profileUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void signup(SignupRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request is required");
        }

        String email = normalizeEmail(request.email());
        String password = request.password();
        String firstName = trimToNull(request.firstName());
        String lastName = trimToNull(request.lastName());

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        if (password.length() < 8) {
            throw new IllegalArgumentException("Password must contain at least 8 characters");
        }

        if (appUserRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already used");
        }

        AppUser user = AppUser.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .firstName(firstName)
                .lastName(lastName)
                .enabled(true)
                .role(UserRole.PHOTOGRAPH)
                .build();

        appUserRepository.save(user);

        Profile profile = Profile.builder()
                .slug(generateUniqueSlug(firstName, lastName, email))
                .displayName(buildDisplayName(firstName, lastName, email))
                .isPublic(true)
                .build();

        profileRepository.save(profile);

        ProfileUser membership = ProfileUser.builder()
                .user(user)
                .profile(profile)
                .role(ProfileRole.OWNER)
                .build();

        profileUserRepository.save(membership);

        user.addMembership(membership);
        profile.getMemberships().add(membership);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String buildDisplayName(String firstName, String lastName, String email) {
        String fullName = ((firstName == null ? "" : firstName) + " " + (lastName == null ? "" : lastName)).trim();
        if (!fullName.isBlank()) {
            return fullName;
        }
        return email.substring(0, email.indexOf('@'));
    }

    private String generateUniqueSlug(String firstName, String lastName, String email) {
        String base = ((firstName == null ? "" : firstName) + "-" + (lastName == null ? "" : lastName))
                .toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");

        if (base.isBlank()) {
            base = email.substring(0, email.indexOf('@'))
                    .toLowerCase()
                    .replaceAll("[^a-z0-9]+", "-")
                    .replaceAll("^-|-$", "");
        }

        String slug = base;
        int counter = 1;

        while (profileRepository.existsBySlug(slug)) {
            slug = base + "-" + counter;
            counter++;
        }

        return slug;
    }


    public void login(LoginRequest request, HttpServletRequest httpRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                context
        );

    }

    public Map<String, Object> me(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return Map.of("authenticated", false);
        }

        return Map.of(
                "authenticated", true,
                "email", authentication.getName(),
                "roles", authentication.getAuthorities()
        );
    }
}
