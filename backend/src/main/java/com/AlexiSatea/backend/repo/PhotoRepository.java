package com.AlexiSatea.backend.repo;

import com.AlexiSatea.backend.model.photo.Theme;
import com.AlexiSatea.backend.model.Interface.PhotoAndFeature;
import com.AlexiSatea.backend.model.photo.Photo;
import com.AlexiSatea.backend.model.photo.feature.PhotoFeatureType;
import jakarta.annotation.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PhotoRepository extends JpaRepository<Photo, UUID> {

    @Query("""
        select ph
        from Photo ph
        where ph.id = :photoId
          and exists (
              select 1
              from ProfileUser pu
              join pu.profile p
              where p.slug = :slug
                and p.isPublic = true
                and pu.user = ph.author
          )
    """)
    Optional<Photo> findPublicPhotoForProfile(@Param("photoId") UUID photoId,
                                              @Param("slug") String slug);

    @Query("""
        select p
        from Photo p
        join ProfileUser pu on pu.user = p.author
        join pu.profile pr
        where pr.slug = :slug
          and pu.user.id = :userId
        order by p.createdAt desc
    """)
    Page<Photo> findManageablePhotos(
            @Param("slug") String slug,
            @Param("userId") UUID userId,
            Pageable pageable
    );

    @Query("""
        select p as photo, pf as photoFeature
        from Photo p
        join ProfileUser pu on pu.user = p.author
        join pu.profile pr
        left join PhotoFeature pf
          on pf.photo = p
         and pf.profile = pr
         and pf.type = :type
         and pf.enabled = true
        where pr.slug = :slug
          and pr.isPublic = true
        order by
          case when pf.id is null then 1 else 0 end,
          pf.orderIndex asc nulls last,
          pf.featuredAt desc,
          p.createdAt desc
""")
    Page<PhotoAndFeature> findFeaturedForProfile(
            @Param("slug") String slug,
            @Param("type") PhotoFeatureType type,
            Pageable pageable
    );

    @Query("""
    select p as photo, pf as photoFeature
    from Photo p
    join ProfileUser pu on pu.user = p.author
    join pu.profile pr
    left join PhotoFeature pf
      on pf.photo = p
     and pf.profile = pr
     and pf.type = :type
     and pf.enabled = true
    left join p.themes t
    where pr.slug = :slug
      and pr.isPublic = true
      and p.id <> :photoId
    group by p, pf, pr
    order by
       (
           case when :hasThemes = true
             then coalesce(sum( case when t in :themes then 1 else 0 end), 0)
             else 0
           end
           + case when :country is not null and p.country = :country then 0.5 else 0 end
           + case when :city is not null and p.city = :city then 0.5 else 0 end
       ) desc,
      pf.orderIndex asc nulls last,
      pf.featuredAt desc,
      p.createdAt desc
""")
Page<PhotoAndFeature> findFeaturedPriorityThemes(
            @Param("slug") String slug,
            @Param("type") PhotoFeatureType type,
            @Param("photoId") UUID photoId,
            @Param("themes")@Nullable List<Theme> themes,
            @Param("hasThemes") boolean hasThemes,
            @Param("country")@Nullable String country,
            @Param("city")@Nullable String city,
            Pageable pageable
    );


    @Query("""
      select t
      from Photo p join p.themes t
      where p.id = :photoId
    """)
    List<Theme> findThemesByPhotoId(@Param("photoId") UUID photoId);

}

