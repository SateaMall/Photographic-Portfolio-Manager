package com.AlexiSatea.backend.repo;

import com.AlexiSatea.backend.model.Enum.FeatureContext;
import com.AlexiSatea.backend.model.Enum.Owner;
import com.AlexiSatea.backend.model.photo.feature.PhotoFeature;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PhotoFeatureRepository extends JpaRepository<PhotoFeature, UUID> {
    Optional<PhotoFeature> findByPhotoIdAndContext(UUID photoId, FeatureContext context);

// Context = {PERSONAL,SHARED}
//Owner = {SATEA, ALEXIS}
// if we want the homepage for Shared - Context = SHARED, Owner = null
    @Query("""
    select pf
    from PhotoFeature pf
    join fetch pf.photo p
    where pf.context = :context
      and pf.enabled = true
      and (:owner is null or p.owner = :owner)
    order by
      pf.orderIndex asc nulls last,
      pf.featuredAt desc,
      p.createdAt desc
""")
    List<PhotoFeature> findFeatured(
            FeatureContext context,
            Owner owner,
            Pageable pageable
    );
}

//TODO add another one to get the entire photos in multiple pages (later)