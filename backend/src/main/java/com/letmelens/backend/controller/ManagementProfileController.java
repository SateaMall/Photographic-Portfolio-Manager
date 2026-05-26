package com.letmelens.backend.controller;

import com.letmelens.backend.dto.ManagedProfileStatsResponse;
import com.letmelens.backend.dto.ProfileRequest;
import com.letmelens.backend.dto.UpdateProfileSlugRequest;
import com.letmelens.backend.service.AuthService;
import com.letmelens.backend.service.ProfileUserService;
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

    @PutMapping("/profile/{profileSlug}/slug")
    public ResponseEntity<?> updateProfileSlug(@PathVariable String profileSlug,
                                               @RequestBody UpdateProfileSlugRequest request,
                                               Authentication authentication) {
        String slug = profileService.updateProfileSlug(profileSlug, request.slug(), authentication);
        return ResponseEntity.ok(Map.of("message", "Profile link updated successfully", "slug", slug));
    }

    @GetMapping("/profile/{profileSlug}/stats")
    public ManagedProfileStatsResponse getProfileStats(@PathVariable String profileSlug,
                                                       Authentication authentication) {
        return profileService.getManageableProfileStats(profileSlug, authentication);
    }
}
