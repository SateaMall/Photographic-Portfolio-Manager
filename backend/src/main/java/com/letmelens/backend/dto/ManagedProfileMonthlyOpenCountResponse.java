package com.letmelens.backend.dto;

public record ManagedProfileMonthlyOpenCountResponse(
        String month,
        long openCount
) {
}
