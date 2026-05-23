package com.letmelens.backend.dto;

import java.util.List;

public record ManagedProfileStatsResponse(
        long totalOpens,
        long opensToday,
        long opensLast30Days,
        List<ManagedProfileMonthlyOpenCountResponse> monthlyCounts,
        List<ManagedProfileYearlyOpenCountResponse> yearlyCounts
) {
}
