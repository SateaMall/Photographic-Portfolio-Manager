package com.letmelens.backend.dto;

public record ManagedProfileYearlyOpenCountResponse(
        int year,
        long openCount
) {
}
