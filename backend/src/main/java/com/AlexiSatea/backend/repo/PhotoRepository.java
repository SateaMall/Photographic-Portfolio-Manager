package com.AlexiSatea.backend.repo;

import com.AlexiSatea.backend.model.Enum.FeatureContext;
import com.AlexiSatea.backend.model.Enum.Owner;
import com.AlexiSatea.backend.model.photo.Theme;
import com.AlexiSatea.backend.model.Interface.PhotoAndFeature;
import com.AlexiSatea.backend.model.photo.Photo;
import jakarta.annotation.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface PhotoRepository extends JpaRepository<Photo, UUID> {
    Page<Photo> findByOwnerOrderByCreatedAtDesc(Owner owner, Pageable pageable);



    @Query("""
    select p as photo, pf as photoFeature
    from Photo p
    left join PhotoFeature pf
        on pf.photo = p
       and pf.context = :context
       and pf.enabled = true
    where (:owner is null or p.owner = :owner)
    order by
      case when pf.id is null then 1 else 0 end,
      pf.orderIndex asc nulls last,
      pf.featuredAt desc,
      p.createdAt desc
""")
    Page<PhotoAndFeature> findFeatured(
            @Param("context") FeatureContext context,
            @Param("owner") @Nullable Owner owner,
            Pageable pageable
    );
    @Query("""
    select p as photo, pf as photoFeature
    from Photo p
    left join PhotoFeature pf
        on pf.photo = p
       and pf.context = :context
       and pf.enabled = true
    left join p.themes t
    where (:owner is null or p.owner = :owner) AND :photoId!=p.id
    group by p, pf
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
            @Param("context") FeatureContext context,
            @Param("owner") @Nullable Owner owner,
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

