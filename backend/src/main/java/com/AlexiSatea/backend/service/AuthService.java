package com.AlexiSatea.backend.service;

import com.AlexiSatea.backend.dto.AuthMeResponse;
import com.AlexiSatea.backend.dto.LoginRequest;
import com.AlexiSatea.backend.dto.SignupRequest;
import com.AlexiSatea.backend.model.profile.Profile;
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
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AppUserRepository appUserRepository;
    private final ProfileRepository profileRepository;
    private final ProfileUserRepository profileUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final SlugService slugService;
    private final EmailVerificationService emailVerificationService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService customUserDetailsService;

    @Transactional
    public void signup(SignupRequest request) {
        String email = normalize(request.email());

        if (appUserRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        String firstName = clean(request.firstName());
        String lastName = clean(request.lastName());

        AppUser user = AppUser.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .firstName(firstName)
                .lastName(lastName)
                .enabled(false)
                .role(UserRole.PHOTOGRAPH)
                .build();

        appUserRepository.save(user);

        Profile profile = Profile.builder()
                .slug(slugService.generateUniqueSlug(firstName, lastName))
                .displayName(buildDisplayName(firstName, lastName))
                .isPublic(true)
                .build();

        profileRepository.save(profile);

        ProfileUser membership = ProfileUser.builder()
                .profile(profile)
                .user(user)
                .build();

        membership.getId().setProfileId(profile.getId());
        membership.getId().setUserId(user.getId());

        profileUserRepository.save(membership);

        emailVerificationService.createAndSendVerificationCode(user);
    }

    private String normalize(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String clean(String value) {
        return value == null ? null : value.trim();
    }

    private String buildDisplayName(String firstName, String lastName) {
        String fullName = (clean(firstName) + " " + clean(lastName)).trim();
        return fullName.isBlank() ? "Photographer" : fullName;
    }

    public void login(LoginRequest request, HttpServletRequest httpRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );
        establishSession(authentication, httpRequest);
    }
    public void establishSession(Authentication authentication, HttpServletRequest httpRequest) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                context
        );
    }

    @Transactional(readOnly = true)
    public AuthMeResponse me(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return AuthMeResponse.anonymous();
        }

        String email = normalize(authentication.getName());
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found: " + email));

        Profile profile = profileRepository.findFirstByMemberships_User_IdOrderByCreatedAtAsc(user.getId())
                .orElseThrow(() -> new IllegalStateException("No profile found for authenticated user: " + email));

        return AuthMeResponse.authenticated(user.getEmail(), profile.getSlug(), profile.getDisplayName());
    }
    public void loginVerifiedUser(String email, HttpServletRequest httpRequest) {
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(normalize(email));
        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                userDetails,
                null,
                userDetails.getAuthorities()
        );
        establishSession(authentication, httpRequest);
    }
}
