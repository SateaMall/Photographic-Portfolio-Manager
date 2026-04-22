package com.letmelens.backend.dto;

public record ProfileRequest(
        String displayName,
        String bio,
        String primaryColor,
        String secondaryColor,
        String publicEmail,
        String linkedIn,
        String instagram,
        String phoneNumber
) {}