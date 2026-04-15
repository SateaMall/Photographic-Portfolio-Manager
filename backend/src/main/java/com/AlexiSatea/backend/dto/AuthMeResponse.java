package com.AlexiSatea.backend.dto;

public record AuthMeResponse(
        boolean authenticated,
        String email,
        String profileSlug,
        String displayName
) {
    public static AuthMeResponse anonymous() {
        return new AuthMeResponse(false, null, null, null);
    }

    public static AuthMeResponse authenticated(String email, String profileSlug, String displayName) {
        return new AuthMeResponse(true, email, profileSlug, displayName);
    }
}
