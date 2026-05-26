package com.letmelens.backend.service;

import com.letmelens.backend.dto.ManagedProfileMonthlyOpenCountResponse;
import com.letmelens.backend.dto.ManagedProfileStatsResponse;
import com.letmelens.backend.dto.ManagedProfileYearlyOpenCountResponse;
import com.letmelens.backend.dto.PublicProfileResponse;
import com.letmelens.backend.dto.ProfileRequest;
import com.letmelens.backend.model.profile.Profile;
import com.letmelens.backend.model.profile.ProfileViewDailyStat;
import com.letmelens.backend.model.user.AppUser;
import com.letmelens.backend.repo.ProfileRepository;
import com.letmelens.backend.repo.ProfileUserRepository;
import com.letmelens.backend.repo.ProfileViewDailyStatRepository;
import com.letmelens.backend.security.AccessService;
import com.letmelens.backend.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.YearMonth;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.letmelens.backend.model.user.UserRole.ADMIN;

@Service
@RequiredArgsConstructor
public class ProfileUserService {

    private final ProfileRepository profileRepository;
    private final ProfileUserRepository profileUserRepository;
    private final ProfileViewDailyStatRepository profileViewDailyStatRepository;
    private final AccessService accessService;
    private final CurrentUserService currentUserService;
    private final SlugService slugService;

    @Transactional(readOnly = true)
    public Optional<PublicProfileResponse> getPublicProfile(String slug) {
        String normalizedSlug = normalizeSlug(slug);
        if (normalizedSlug == null) {
            return Optional.empty();
        }

        return profileRepository.findBySlugAndIsPublicTrue(normalizedSlug)
                .map(PublicProfileResponse::from);
    }

    @Transactional
    public boolean recordPublicProfileOpen(String slug, Authentication authentication) {
        String normalizedSlug = normalizeSlug(slug);
        if (normalizedSlug == null) {
            return false;
        }

        Profile profile = profileRepository.findBySlugAndIsPublicTrue(normalizedSlug)
                .orElse(null);
        if (profile == null) {
            return false;
        }

        if (shouldSkipProfileOpen(profile, authentication)) {
            return true;
        }

        incrementDailyOpenCount(profile);
        return true;
    }

    @Transactional(readOnly = true)
    public ManagedProfileStatsResponse getManageableProfileStats(String profileSlug, Authentication authentication) {
        AppUser currentUser = currentUserService.requireCurrentUser(authentication);
        String normalizedSlug = normalizeSlug(profileSlug);
        if (normalizedSlug == null) {
            throw new IllegalArgumentException("Profile slug is required");
        }

        Profile profile = accessService.requireManageableProfile(currentUser.getId(), normalizedSlug);

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate firstDayOfLast30Days = today.minusDays(29);
        LocalDate firstViewDate = profileViewDailyStatRepository.findFirstViewDateByProfileId(profile.getId());
        LocalDate firstTrackedDate = firstViewDate == null ? today : firstViewDate;
        LocalDate firstTrackedMonth = firstTrackedDate.withDayOfMonth(1);
        LocalDate firstTrackedYear = firstTrackedDate.withDayOfYear(1);
        LocalDate lastTrackedMonth = today.with(TemporalAdjusters.lastDayOfMonth());
        LocalDate lastTrackedYear = today.with(TemporalAdjusters.lastDayOfYear());

        long totalOpens = profileViewDailyStatRepository.sumOpenCountByProfileId(profile.getId());
        long opensToday = profileViewDailyStatRepository.sumOpenCountByProfileIdAndViewDateBetween(profile.getId(), today, today);
        long opensLast30Days = profileViewDailyStatRepository.sumOpenCountByProfileIdAndViewDateBetween(
                profile.getId(),
                firstDayOfLast30Days,
                today
        );

        List<ProfileViewDailyStat> fullPeriodStats = profileViewDailyStatRepository.findAllByProfile_IdAndViewDateBetweenOrderByViewDateAsc(
                profile.getId(),
                firstTrackedDate,
                today
        );

        return new ManagedProfileStatsResponse(
                totalOpens,
                opensToday,
                opensLast30Days,
                buildMonthlyCounts(firstTrackedMonth, lastTrackedMonth, fullPeriodStats),
                buildYearlyCounts(firstTrackedYear.getYear(), lastTrackedYear.getYear(), fullPeriodStats)
        );
    }

    @Transactional
    public void initProfile(ProfileRequest request, Authentication authentication) {
        AppUser currentUser = currentUserService.requireCurrentUser(authentication);

        Profile profile = profileRepository.findFirstByMemberships_User_IdOrderByCreatedAtAsc(currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("No profile found for current user"));

        applyChanges(profile, request);

        profileRepository.save(profile);
    }

    @Transactional
    public void updateProfile(String profileSlug, ProfileRequest request, Authentication authentication) {
        AppUser currentUser = currentUserService.requireCurrentUser(authentication);

        Profile profile = profileRepository.findBySlugAndMemberships_User_Id(profileSlug.trim().toLowerCase(), currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found or access denied"));

        applyChanges(profile, request);

        profileRepository.save(profile);
    }

    @Transactional
    public String updateProfileSlug(String profileSlug, String requestedSlug, Authentication authentication) {
        AppUser currentUser = currentUserService.requireCurrentUser(authentication);

        Profile profile = profileRepository.findBySlugAndMemberships_User_Id(profileSlug.trim().toLowerCase(), currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found or access denied"));

        String normalizedSlug = slugService.normalizeSlug(requestedSlug);
        if (normalizedSlug.isBlank()) {
            throw new IllegalArgumentException("Profile slug is required.");
        }

        if (normalizedSlug.length() < 3) {
            throw new IllegalArgumentException("Profile slug must be at least 3 characters.");
        }

        if (normalizedSlug.length() > 80) {
            throw new IllegalArgumentException("Profile slug must be 80 characters or fewer.");
        }

        if (normalizedSlug.equals(profile.getSlug())) {
            return profile.getSlug();
        }

        profileRepository.findBySlug(normalizedSlug)
                .filter(existingProfile -> !existingProfile.getId().equals(profile.getId()))
                .ifPresent(existingProfile -> {
                    throw new IllegalArgumentException("That profile link is already taken.");
                });

        profile.setSlug(normalizedSlug);
        profileRepository.save(profile);
        return profile.getSlug();
    }

    private void applyChanges(Profile profile, ProfileRequest request) {
        if (request.displayName() != null && !request.displayName().isBlank()) {
            profile.setDisplayName(request.displayName().trim());
        }

        profile.setBio(trimToNull(request.bio()));
        profile.setPrimaryColor(trimToNull(request.primaryColor()));
        profile.setSecondaryColor(trimToNull(request.secondaryColor()));
        profile.setPublicEmail(normalizeEmail(request.publicEmail()));
        profile.setLinkedIn(trimToNull(request.linkedIn()));
        profile.setInstagram(trimToNull(request.instagram()));
        profile.setPhoneNumber(trimToNull(request.phoneNumber()));
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private String normalizeSlug(String slug) {
        if (slug == null) {
            return null;
        }

        String normalizedSlug = slug.trim().toLowerCase();
        return normalizedSlug.isBlank() ? null : normalizedSlug;
    }

    private String normalizeEmail(String value) {
        if (value == null) return null;
        String trimmed = value.trim().toLowerCase();
        return trimmed.isBlank() ? null : trimmed;
    }

    private boolean shouldSkipProfileOpen(Profile profile, Authentication authentication) {
        return currentUserService.findCurrentUser(authentication)
                .map(currentUser -> currentUser.getRole() == ADMIN
                        || profileUserRepository.existsByProfile_IdAndUser_Id(profile.getId(), currentUser.getId()))
                .orElse(false);
    }

    private void incrementDailyOpenCount(Profile profile) {
        LocalDate viewDate = LocalDate.now(ZoneOffset.UTC);
        Instant now = Instant.now();

        if (profileViewDailyStatRepository.incrementOpenCount(profile.getId(), viewDate, now) > 0) {
            return;
        }

        try {
            profileViewDailyStatRepository.save(ProfileViewDailyStat.builder()
                    .profile(profile)
                    .viewDate(viewDate)
                    .openCount(1L)
                    .build());
        } catch (DataIntegrityViolationException caughtException) {
            if (profileViewDailyStatRepository.incrementOpenCount(profile.getId(), viewDate, now) == 0) {
                throw caughtException;
            }
        }
    }

    private List<ManagedProfileMonthlyOpenCountResponse> buildMonthlyCounts(LocalDate firstMonth,
                                                                            LocalDate lastMonth,
                                                                            List<ProfileViewDailyStat> stats) {
        Map<YearMonth, Long> openCountsByMonth = new HashMap<>();
        stats.forEach(stat -> openCountsByMonth.merge(YearMonth.from(stat.getViewDate()), stat.getOpenCount(), Long::sum));

        List<ManagedProfileMonthlyOpenCountResponse> counts = new ArrayList<>();
        for (YearMonth currentMonth = YearMonth.from(firstMonth);
             !currentMonth.isAfter(YearMonth.from(lastMonth));
             currentMonth = currentMonth.plusMonths(1)) {
            counts.add(new ManagedProfileMonthlyOpenCountResponse(
                    currentMonth.toString(),
                    openCountsByMonth.getOrDefault(currentMonth, 0L)
            ));
        }
        return counts;
    }

    private List<ManagedProfileYearlyOpenCountResponse> buildYearlyCounts(int firstYear,
                                                                          int lastYear,
                                                                          List<ProfileViewDailyStat> stats) {
        Map<Integer, Long> openCountsByYear = new HashMap<>();
        stats.forEach(stat -> openCountsByYear.merge(stat.getViewDate().getYear(), stat.getOpenCount(), Long::sum));

        List<ManagedProfileYearlyOpenCountResponse> counts = new ArrayList<>();
        for (int year = firstYear; year <= lastYear; year++) {
            counts.add(new ManagedProfileYearlyOpenCountResponse(
                    year,
                    openCountsByYear.getOrDefault(year, 0L)
            ));
        }
        return counts;
    }
}
