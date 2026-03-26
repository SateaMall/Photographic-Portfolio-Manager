package com.AlexiSatea.backend.service;

import com.AlexiSatea.backend.model.profile.Profile;
import com.AlexiSatea.backend.model.user.AppUser;
import com.AlexiSatea.backend.model.user.ProfileUser;
import com.AlexiSatea.backend.model.user.ProfileUserId;
import com.AlexiSatea.backend.model.user.UserRole;
import com.AlexiSatea.backend.repo.AppUserRepository;
import com.AlexiSatea.backend.repo.ProfileRepository;
import com.AlexiSatea.backend.repo.ProfileUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
@RequiredArgsConstructor
@Transactional
public class TestService {

    private final AppUserRepository userRepository;
    private final ProfileUserRepository profileUserRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;

    public String signUpTest() {
        Profile profile = Profile.builder()
                .slug("satea")
                .displayName("Mohamad Satea ALMALLOUHI")
                .bio("Amateur photographer, interested in photography")
                .publicEmail("sate3.mallouhi@gmail.com")
                .linkedIn("satea-almallouhi")
                .build();

        AppUser appUser = AppUser.builder()
                .email("sate3.mallouhi@gmail.com")
                .firstName("Satea")
                .lastName("Mallouhi")
                .passwordHash(passwordEncoder.encode("00000000"))
                .role(UserRole.ADMIN)
                .build();

        appUser = userRepository.save(appUser);
        profile = profileRepository.save(profile);

        ProfileUser profileUser = ProfileUser.builder()
                .id(new ProfileUserId(profile.getId(), appUser.getId()))
                .profile(profile)
                .user(appUser)
                .build();

        profileUserRepository.save(profileUser);

        return "Created user " + appUser.getEmail() + " with profile " + profile.getSlug();
    }
}