package com.letmelens.backend.service;

import com.letmelens.backend.dto.AuthMeResponse;
import com.letmelens.backend.dto.LoginRequest;
import com.letmelens.backend.dto.SignupRequest;
import com.letmelens.backend.model.profile.Profile;
import com.letmelens.backend.model.user.AppUser;
import com.letmelens.backend.model.user.ProfileUser;
import com.letmelens.backend.model.user.UserRole;
import com.letmelens.backend.model.photo.Photo;
import com.letmelens.backend.model.album.Album;
import com.letmelens.backend.repo.AppUserRepository;
import com.letmelens.backend.repo.AlbumRepository;
import com.letmelens.backend.repo.EmailVerificationCodeRepository;
import com.letmelens.backend.repo.PhotoFeatureRepository;
import com.letmelens.backend.repo.PhotoRepository;
import com.letmelens.backend.repo.ProfileRepository;
import com.letmelens.backend.repo.ProfileUserRepository;
import com.letmelens.backend.security.CurrentUserService;
import com.letmelens.backend.register.StorageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AppUserRepository appUserRepository;
    private final ProfileRepository profileRepository;
    private final ProfileUserRepository profileUserRepository;
    private final PhotoRepository photoRepository;
    private final AlbumRepository albumRepository;
    private final PhotoFeatureRepository photoFeatureRepository;
    private final EmailVerificationCodeRepository emailVerificationCodeRepository;
    private final CurrentUserService currentUserService;
    private final StorageService storageService;
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

        AppUser user = createUser(
                email,
                passwordEncoder.encode(request.password()),
                firstName,
                lastName,
                false,
                null,
                null
        );

        createProfileMembership(user, firstName, lastName);
        emailVerificationService.createAndSendVerificationCode(user);
    }

    public void login(LoginRequest request, HttpServletRequest httpRequest) {
        String email = normalize(request.email());

        appUserRepository.findByEmail(email)
                .filter(user -> user.getPasswordHash() == null)
                .ifPresent(user -> {
                    throw new BadCredentialsException("Invalid email or password.");
                });

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        request.password()
                )
        );
        establishSession(authentication, httpRequest);
    }

    @Transactional
    public void loginWithGoogle(Authentication authentication, HttpServletRequest httpRequest) {
        GoogleUser googleUser = extractGoogleUser(authentication);

        if (!hasText(googleUser.subject())) {
            throw new IllegalArgumentException("Unable to read your Google account details.");
        }

        if (!hasText(googleUser.email())) {
            throw new IllegalArgumentException("Your Google account did not provide an email address.");
        }

        if (!googleUser.emailVerified()) {
            throw new IllegalArgumentException("Your Google account must have a verified email address.");
        }

        AppUser user = appUserRepository.findByGoogleSubject(googleUser.subject())
                .orElseGet(() -> linkOrCreateGoogleUser(googleUser));

        loginVerifiedUser(user.getEmail(), httpRequest);
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

    @Transactional
    public void deleteCurrentUser(Authentication authentication) {
        AppUser currentUser = currentUserService.requireCurrentUser(authentication);
        UUID userId = currentUser.getId();

        List<Profile> profiles = profileRepository.findAllByMemberships_User_Id(userId);
        List<UUID> removableProfileIds = profiles.stream()
                .filter(profile -> profileUserRepository.countByProfile_Id(profile.getId()) <= 1)
                .map(Profile::getId)
                .toList();

        Map<UUID, Album> albumsToDelete = new LinkedHashMap<>();
        albumRepository.findAllByCreatedBy_Id(userId)
                .forEach(album -> albumsToDelete.put(album.getId(), album));

        if (!removableProfileIds.isEmpty()) {
            albumRepository.findAllByOwnerProfile_IdIn(removableProfileIds)
                    .forEach(album -> albumsToDelete.put(album.getId(), album));
        }

        if (!albumsToDelete.isEmpty()) {
            albumRepository.deleteAll(albumsToDelete.values());
        }

        List<Photo> photos = photoRepository.findAllByAuthor_Id(userId);
        if (!photos.isEmpty()) {
            photos.forEach(this::deletePhotoAssetsQuietly);
            photoFeatureRepository.deleteByPhoto_IdIn(photos.stream().map(Photo::getId).toList());
            photoRepository.deleteAll(photos);
        }

        if (!removableProfileIds.isEmpty()) {
            photoFeatureRepository.deleteByProfile_IdIn(removableProfileIds);
            profileRepository.deleteAll(profiles.stream()
                    .filter(profile -> removableProfileIds.contains(profile.getId()))
                    .toList());
        }

        emailVerificationCodeRepository.deleteByUser_Id(userId);
        appUserRepository.delete(currentUser);
    }

    private AppUser linkOrCreateGoogleUser(GoogleUser googleUser) {
        return appUserRepository.findByEmail(googleUser.email())
                .map(existingUser -> linkGoogleUser(existingUser, googleUser))
                .orElseGet(() -> createGoogleUser(googleUser));
    }

    private AppUser linkGoogleUser(AppUser user, GoogleUser googleUser) {
        if (!user.isEnabled()) {
            throw new IllegalArgumentException(
                    "This email already belongs to an account that still needs email verification."
            );
        }

        if (hasText(user.getGoogleSubject()) && !user.getGoogleSubject().equals(googleUser.subject())) {
            throw new IllegalArgumentException("This account is already linked to a different Google sign-in.");
        }

        user.setGoogleSubject(googleUser.subject());

        if (!hasText(user.getFirstName()) && hasText(googleUser.firstName())) {
            user.setFirstName(googleUser.firstName());
        }

        if (!hasText(user.getLastName()) && hasText(googleUser.lastName())) {
            user.setLastName(googleUser.lastName());
        }

        return appUserRepository.save(user);
    }

    private AppUser createGoogleUser(GoogleUser googleUser) {
        String firstName = resolveFirstName(googleUser);
        String lastName = resolveLastName(googleUser);

        AppUser user = createUser(
                googleUser.email(),
                null,
                firstName,
                lastName,
                true,
                Instant.now(),
                googleUser.subject()
        );

        createProfileMembership(user, firstName, lastName);
        return user;
    }

    private AppUser createUser(
            String email,
            String passwordHash,
            String firstName,
            String lastName,
            boolean enabled,
            Instant emailVerifiedAt,
            String googleSubject
    ) {
        AppUser user = AppUser.builder()
                .email(email)
                .passwordHash(passwordHash)
                .googleSubject(googleSubject)
                .firstName(firstName)
                .lastName(lastName)
                .enabled(enabled)
                .emailVerifiedAt(emailVerifiedAt)
                .role(UserRole.PHOTOGRAPH)
                .build();

        return appUserRepository.save(user);
    }

    private void createProfileMembership(AppUser user, String firstName, String lastName) {
        Profile profile = Profile.builder()
                .slug(slugService.generateUniqueSlug(defaultProfileSeed(firstName), defaultProfileSeed(lastName)))
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
    }

    private GoogleUser extractGoogleUser(Authentication authentication) {
        Object principal = authentication.getPrincipal();

        if (principal instanceof OidcUser oidcUser) {
            return new GoogleUser(
                    clean(oidcUser.getSubject()),
                    normalize(oidcUser.getEmail()),
                    clean(oidcUser.getGivenName()),
                    clean(oidcUser.getFamilyName()),
                    clean(oidcUser.getFullName()),
                    Boolean.TRUE.equals(oidcUser.getEmailVerified())
            );
        }

        if (principal instanceof OAuth2User oauth2User) {
            Map<String, Object> attributes = oauth2User.getAttributes();
            return new GoogleUser(
                    clean(readString(attributes, "sub")),
                    normalize(readString(attributes, "email")),
                    clean(readString(attributes, "given_name")),
                    clean(readString(attributes, "family_name")),
                    clean(readString(attributes, "name")),
                    Boolean.TRUE.equals(readBoolean(attributes, "email_verified"))
            );
        }

        throw new IllegalArgumentException("Unable to read your Google account details.");
    }

    private String normalize(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String clean(String value) {
        return value == null ? null : value.trim();
    }

    private String buildDisplayName(String firstName, String lastName) {
        String cleanFirstName = clean(firstName);
        String cleanLastName = clean(lastName);
        String fullName = ((cleanFirstName == null ? "" : cleanFirstName) + " "
                + (cleanLastName == null ? "" : cleanLastName)).trim();
        return fullName.isBlank() ? "Photographer" : fullName;
    }

    private String resolveFirstName(GoogleUser googleUser) {
        if (hasText(googleUser.firstName())) {
            return googleUser.firstName();
        }

        if (hasText(googleUser.fullName())) {
            String[] nameParts = googleUser.fullName().split("\\s+", 2);
            return clean(nameParts[0]);
        }

        return emailLocalPart(googleUser.email());
    }

    private String resolveLastName(GoogleUser googleUser) {
        if (hasText(googleUser.lastName())) {
            return googleUser.lastName();
        }

        if (hasText(googleUser.fullName())) {
            String[] nameParts = googleUser.fullName().split("\\s+", 2);
            if (nameParts.length > 1) {
                return clean(nameParts[1]);
            }
        }

        return "";
    }

    private String defaultProfileSeed(String value) {
        return hasText(value) ? value : "profile";
    }

    private String emailLocalPart(String email) {
        if (!hasText(email)) {
            return "Photographer";
        }

        int separatorIndex = email.indexOf('@');
        if (separatorIndex <= 0) {
            return email;
        }

        return email.substring(0, separatorIndex);
    }

    private String readString(Map<String, Object> attributes, String key) {
        Object value = attributes.get(key);
        return value instanceof String stringValue ? stringValue : null;
    }

    private Boolean readBoolean(Map<String, Object> attributes, String key) {
        Object value = attributes.get(key);

        if (value instanceof Boolean booleanValue) {
            return booleanValue;
        }

        if (value instanceof String stringValue) {
            return Boolean.parseBoolean(stringValue);
        }

        return null;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private void deletePhotoAssetsQuietly(Photo photo) {
        deleteStorageKeyQuietly(photo.getOriginalKey());
        deleteStorageKeyQuietly(photo.getMediumKey());
        deleteStorageKeyQuietly(photo.getThumbKey());
    }

    private void deleteStorageKeyQuietly(String key) {
        try {
            storageService.delete(key);
        } catch (Exception ignored) {
        }
    }

    private record GoogleUser(
            String subject,
            String email,
            String firstName,
            String lastName,
            String fullName,
            boolean emailVerified
    ) {
    }
}
