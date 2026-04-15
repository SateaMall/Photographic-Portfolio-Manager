package com.AlexiSatea.backend.controller;

import com.AlexiSatea.backend.dto.PublicProfileResponse;
import com.AlexiSatea.backend.service.ProfileUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/public")
public class PublicProfileController {

    private final ProfileUserService profileUserService;

    @GetMapping("/profiles/{slug}")
    public ResponseEntity<PublicProfileResponse> getProfile(@PathVariable String slug) {
        return profileUserService.getPublicProfile(slug)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
