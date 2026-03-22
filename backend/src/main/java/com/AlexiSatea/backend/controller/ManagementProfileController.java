package com.AlexiSatea.backend.controller;

import com.AlexiSatea.backend.dto.ProfileRequest;
import com.AlexiSatea.backend.service.AuthService;
import com.AlexiSatea.backend.service.ProfileUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/manage/profile")
public class ManagementProfileController {
    private final AuthService authService;
    private final ProfileUserService profileService;
    @PostMapping("/initprofile")
    public ResponseEntity<?> initProfile(@RequestBody ProfileRequest request,
                                         Authentication authentication) {
        profileService.initProfile(request, authentication);
        return ResponseEntity.ok(Map.of("message", "Profile initialized successfully"));
    }

    @PutMapping("/profile/{profileSlug}")
    public ResponseEntity<?> updateProfile(@PathVariable String profileSlug,
                                           @RequestBody ProfileRequest request,
                                           Authentication authentication) {
        profileService.updateProfile(profileSlug, request, authentication);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }
}
