package com.AlexiSatea.backend.service;

import com.AlexiSatea.backend.dto.ProfileRequest;
import com.AlexiSatea.backend.model.profile.Profile;
import com.AlexiSatea.backend.model.user.AppUser;
import com.AlexiSatea.backend.repo.ProfileRepository;
import com.AlexiSatea.backend.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileUserService {

    private final ProfileRepository profileRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public void initProfile(ProfileRequest request, Authentication authentication) {
        AppUser currentUser = currentUserService.requireCurrentUser(authentication);

        Profile profile = profileRepository.findFirstByMemberships_User_IdOrderByCreatedAtAsc(currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("No profile found for current user"));

        applyChanges(profile, request);

        profileRepository.save(profile);
    }

    @Transactional
    public void updateProfile(String profileSlug, ProfileRequest request, Authentication authentication) {
        AppUser currentUser = currentUserService.requireCurrentUser(authentication);

        Profile profile = profileRepository.findBySlugAndMemberships_User_Id(profileSlug.trim().toLowerCase(), currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found or access denied"));

        applyChanges(profile, request);

        profileRepository.save(profile);
    }

    private void applyChanges(Profile profile, ProfileRequest request) {
        if (request.displayName() != null && !request.displayName().isBlank()) {
            profile.setDisplayName(request.displayName().trim());
        }

        profile.setBio(trimToNull(request.bio()));
        profile.setPrimaryColor(trimToNull(request.primaryColor()));
        profile.setSecondaryColor(trimToNull(request.secondaryColor()));
        profile.setPublicEmail(normalizeEmail(request.publicEmail()));
        profile.setLinkedIn(trimToNull(request.linkedIn()));
        profile.setInstagram(trimToNull(request.instagram()));
        profile.setPhoneNumber(trimToNull(request.phoneNumber()));
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private String normalizeEmail(String value) {
        if (value == null) return null;
        String trimmed = value.trim().toLowerCase();
        return trimmed.isBlank() ? null : trimmed;
    }
}
