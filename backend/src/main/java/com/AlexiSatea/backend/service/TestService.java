package com.AlexiSatea.backend.service;

import com.AlexiSatea.backend.model.profile.Profile;
import com.AlexiSatea.backend.model.user.AppUser;
import com.AlexiSatea.backend.model.user.UserRole;
import com.AlexiSatea.backend.repo.AppUserRepository;
import com.AlexiSatea.backend.repo.ProfileUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TestService {
    private final AppUserRepository userRepository;
    private final ProfileUserRepository profileUserRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    public String signUpTest(){
        Profile profile = Profile.builder()
                .slug("Satea")
                .displayName("Mohamad Satea ALMALLOUHI")
                .bio("Amature photographer, interesed in photography")
                .publicEmail("sate3.mallouhi@gmail.com")
                .linkedIn("")
                .build();
        AppUser appUser = AppUser.builder()
                .email("sate3.mallouhi@gmail.com")
                .firstName("sate3")
                .lastName("mallouhi")
                .passwordHash(passwordEncoder.encode("00000000"))
                .role(UserRole.ADMIN)

                .build();
        userRepository.save(appUser);
        return appUser.toString();
    }
}
