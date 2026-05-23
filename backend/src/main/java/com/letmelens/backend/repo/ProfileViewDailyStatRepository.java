package com.letmelens.backend.repo;

import com.letmelens.backend.model.profile.ProfileViewDailyStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ProfileViewDailyStatRepository extends JpaRepository<ProfileViewDailyStat, UUID> {

    @Modifying
    @Query("""
        update ProfileViewDailyStat stat
        set stat.openCount = stat.openCount + 1,
            stat.updatedAt = :updatedAt
        where stat.profile.id = :profileId
          and stat.viewDate = :viewDate
    """)
    int incrementOpenCount(@Param("profileId") UUID profileId,
                           @Param("viewDate") LocalDate viewDate,
                           @Param("updatedAt") Instant updatedAt);

    @Query("""
        select coalesce(sum(stat.openCount), 0)
        from ProfileViewDailyStat stat
        where stat.profile.id = :profileId
    """)
    long sumOpenCountByProfileId(@Param("profileId") UUID profileId);

    @Query("""
        select min(stat.viewDate)
        from ProfileViewDailyStat stat
        where stat.profile.id = :profileId
    """)
    LocalDate findFirstViewDateByProfileId(@Param("profileId") UUID profileId);

    @Query("""
        select coalesce(sum(stat.openCount), 0)
        from ProfileViewDailyStat stat
        where stat.profile.id = :profileId
          and stat.viewDate between :startDate and :endDate
    """)
    long sumOpenCountByProfileIdAndViewDateBetween(@Param("profileId") UUID profileId,
                                                   @Param("startDate") LocalDate startDate,
                                                   @Param("endDate") LocalDate endDate);

    List<ProfileViewDailyStat> findAllByProfile_IdAndViewDateBetweenOrderByViewDateAsc(UUID profileId,
                                                                                        LocalDate startDate,
                                                                                        LocalDate endDate);
}
