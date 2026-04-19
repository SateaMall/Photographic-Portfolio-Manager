package com.letmelens.backend.repo;

import com.letmelens.backend.model.photo.feature.PhotoFeature;
import com.letmelens.backend.model.photo.feature.PhotoFeatureType;
import com.letmelens.backend.model.profile.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PhotoFeatureRepository extends JpaRepository<PhotoFeature, UUID> {
    Optional<PhotoFeature> findByPhoto_IdAndTypeAndProfile(UUID photoId, PhotoFeatureType type, Profile profile);

    @Query("""
        select pf
        from PhotoFeature pf
        join fetch pf.photo p
        join pf.profile pr
        where pr.slug = :slug
          and pr.isPublic = true
          and pf.type = :type
          and pf.enabled = true
        order by pf.orderIndex asc nulls last, pf.featuredAt desc, p.createdAt desc
    """)
    List<PhotoFeature> findEnabledPublicFeaturesByProfileSlug(
            @Param("slug") String slug,
            @Param("type") PhotoFeatureType type
    );

    @Query("""
        select pf
        from PhotoFeature pf
        join fetch pf.photo p
        where pf.profile.id = :profileId
          and pf.type = :type
          and pf.enabled = true
        order by pf.orderIndex asc nulls last, pf.featuredAt desc, p.createdAt desc
    """)
    List<PhotoFeature> findEnabledFeaturesByProfileId(
            @Param("profileId") UUID profileId,
            @Param("type") PhotoFeatureType type
    );

    void deleteByPhoto_IdIn(List<UUID> photoIds);

    void deleteByProfile_IdIn(List<UUID> profileIds);

}
