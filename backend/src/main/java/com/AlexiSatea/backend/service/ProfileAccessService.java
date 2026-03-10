package com.AlexiSatea.backend.service;

import com.AlexiSatea.backend.model.user.AppUser;
import com.AlexiSatea.backend.repo.AppUserRepository;
import com.AlexiSatea.backend.repo.ProfileUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileAccessService {

    private final AppUserRepository userRepository;
    private final ProfileUserRepository profileUserRepository;

    public void checkCanManageProfile(Authentication authentication, UUID profileId) {
        String email = authentication.getName();

        AppUser user = userRepository.findByEmail(email)
                .orElseThrow();

        boolean allowed = profileUserRepository
                .existsByProfileIdAndUserId(profileId, user.getId());

        if (!allowed) {
            throw new AccessDeniedException("You cannot manage this profile");
        }
    }
}