package com.letmelens.backend.service;

import com.letmelens.backend.model.user.AppUser;
import com.letmelens.backend.repo.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private static final String OAUTH_ONLY_PASSWORD_HASH =
            "$2b$12$xhtlvjBzkxaTnhoTFt0il.uM.64GFmjtB.hR3BOwGt9yhq/qrl7C.";

    private final AppUserRepository appUserRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash() != null ? user.getPasswordHash() : OAUTH_ONLY_PASSWORD_HASH)
                .roles(user.getRole().name())
                .disabled(!user.isEnabled())
                .build();
    }
}
