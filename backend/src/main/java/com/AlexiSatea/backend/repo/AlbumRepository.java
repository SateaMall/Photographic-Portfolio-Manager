package com.AlexiSatea.backend.repo;


import com.AlexiSatea.backend.model.album.Album;
import com.AlexiSatea.backend.model.Interface.AlbumViewRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AlbumRepository extends JpaRepository<Album, UUID> {
//  :#{#scope.name()} is used bcz using :scope would return the index of the enum (smallint)

    @Query(value = """
    select distinct on (ap.album_id)
        a.id as albumId,
        a.title as title,
        a.description as description,
        ap.photo_id as firstPhotoId,
        count(*) over (partition by ap.album_id) as numberOfPhotos
    from albums a
    inner join album_photos ap on ap.album_id = a.id
    join profiles p on p.id = a.owner_profile_id AND p.slug = :slug
    where a.is_public = true
    order by
        ap.album_id,
        ap.position asc nulls last,
        ap.added_at asc
    """, nativeQuery = true)
    List<AlbumViewRow> findAlbumViews(String slug);

    @Query(value = """
select distinct on (ap.album_id)
    a.id as albumId,
    a.title as title,
    a.description as description,
    ap.photo_id as firstPhotoId,
    count(*) over (partition by ap.album_id) as numberOfPhotos
from albums a
join album_photos ap on ap.album_id = a.id
where a.id = :albumId
order by
    ap.album_id,
    ap.position asc nulls last,
    ap.added_at asc
""", nativeQuery = true)
    AlbumViewRow findAlbumViewById(@Param("albumId") UUID albumId);




}


