package com.AlexiSatea.backend.repo;


import com.AlexiSatea.backend.model.album.Album;
import com.AlexiSatea.backend.model.Interface.AlbumViewRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface AlbumRepository extends JpaRepository<Album, UUID> {
//  :#{#scope.name()} is used bcz using :scope would return the index of the enum (smallint)

    @Query(value = """
    select
        a.id as albumId,
        (
            select ap2.photo_id
            from album_photos ap2
            where ap2.album_id = a.id
            order by ap2.position asc, ap2.added_at asc
            limit 1
        ) as firstPhotoId,
        a.title as title,
        a.description as description,
        coalesce(count(ap.photo_id), 0) as numberOfPhotos
    from albums a
    join profiles p on p.id = a.owner_profile_id AND p.slug = :slug
    left join album_photos ap on ap.album_id = a.id
    group by a.id, a.title, a.description, a.created_at
    order by a.created_at desc
    """, nativeQuery = true)
    List<AlbumViewRow> findManageableAlbumViews(@Param("slug") String slug);

    @Query(value = """
    select
        a.id as albumId,
        (
            select ap2.photo_id
            from album_photos ap2
            where ap2.album_id = a.id
            order by ap2.position asc, ap2.added_at asc
            limit 1
        ) as firstPhotoId,
        a.title as title,
        a.description as description,
        coalesce(count(ap.photo_id), 0) as numberOfPhotos
    from albums a
    join profiles p on p.id = a.owner_profile_id AND p.slug = :slug
    left join album_photos ap on ap.album_id = a.id
    where a.is_public = true
    group by a.id, a.title, a.description, a.created_at
    order by a.created_at desc
    """, nativeQuery = true)
    List<AlbumViewRow> findAlbumViews(String slug);

    @Query(value = """
select
    a.id as albumId,
    (
        select ap2.photo_id
        from album_photos ap2
        where ap2.album_id = a.id
        order by ap2.position asc, ap2.added_at asc
        limit 1
    ) as firstPhotoId,
    a.title as title,
    a.description as description,
    coalesce(count(ap.photo_id), 0) as numberOfPhotos
from albums a
left join album_photos ap on ap.album_id = a.id
where a.id = :albumId
group by a.id, a.title, a.description, a.created_at
""", nativeQuery = true)
    AlbumViewRow findAlbumViewById(@Param("albumId") UUID albumId);

    List<Album> findAllByCreatedBy_Id(UUID userId);

    List<Album> findAllByOwnerProfile_IdIn(Collection<UUID> profileIds);




}


