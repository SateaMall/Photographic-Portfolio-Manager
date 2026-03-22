package com.AlexiSatea.backend.repo;

import com.AlexiSatea.backend.model.photo.feature.PhotoFeature;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PhotoFeatureRepository extends JpaRepository<PhotoFeature, UUID> {
    //Optional<PhotoFeature> findByPhotoIdAndContext(UUID photoId, FeatureContext context);

}
