package com.AlexiSatea.backend.repo;

import com.AlexiSatea.backend.model.AlbumPhoto;
import com.AlexiSatea.backend.model.AlbumPhotoId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AlbumPhotoRepository extends JpaRepository<AlbumPhoto, AlbumPhotoId> {

    @Query("select coalesce(max(ap.position), 0) + 1 from AlbumPhoto ap where ap.album.id = :albumId")
    int findNextPosition(@Param("albumId") UUID albumId);

    boolean existsByAlbum_IdAndPhoto_Id(UUID albumId, UUID photoId);

    boolean existsById(AlbumPhotoId id);

    @Query("""
        select ap
        from AlbumPhoto ap
        join fetch ap.photo
        where ap.album.id = :albumId
        order by ap.position asc, ap.addedAt asc
    """)
    Page<AlbumPhoto> findByAlbumIdWithPhoto(@Param("albumId") UUID albumId,
                                            Pageable pageable);
    @Query("""
        select ap
        from AlbumPhoto ap
        join fetch ap.album
        where ap.photo.id = :photoId
    """)
    List<AlbumPhoto> findByPhotoIdWithAlbum(@Param("photoId") UUID photoId);

    @Query("""
        select ap.photo.id
        from AlbumPhoto ap
        where ap.album.id = :albumId
    """)
    List<UUID> findPhotoIdsByAlbumId(@Param("albumId") UUID albumId);

    @Query("""
        select ap.album.id
        from AlbumPhoto ap
        where ap.photo.id = :photoId
    """)

    List<UUID> findAlbumIdsByPhotoId(@Param("photoId") UUID photoId);
}

