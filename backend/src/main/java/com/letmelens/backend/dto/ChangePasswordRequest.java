package com.letmelens.backend.dto;

public record ChangePasswordRequest(
        String currentPassword,
        String newPassword
) {}
