package com.letmelens.backend.dto;

import com.letmelens.backend.model.profile.Profile;

public record PublicProfileResponse(
        String slug,
        String displayName,
        String bio,
        String primaryColor,
        String secondaryColor,
        String publicEmail,
        String linkedIn,
        String instagram
) {
    public static PublicProfileResponse from(Profile profile) {
        return new PublicProfileResponse(
                profile.getSlug(),
                profile.getDisplayName(),
                profile.getBio(),
                profile.getPrimaryColor(),
                profile.getSecondaryColor(),
                profile.getPublicEmail(),
                profile.getLinkedIn(),
                profile.getInstagram()
        );
    }
}
