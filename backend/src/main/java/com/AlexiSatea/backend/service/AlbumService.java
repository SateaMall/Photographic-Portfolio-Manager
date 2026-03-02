package com.AlexiSatea.backend.service;

import com.AlexiSatea.backend.dto.AlbumPhotoItem;
import com.AlexiSatea.backend.dto.AlbumResponse;
import com.AlexiSatea.backend.dto.AlbumViewResponse;
import com.AlexiSatea.backend.model.Enum.AlbumScope;
import com.AlexiSatea.backend.model.Interface.AlbumViewRow;
import com.AlexiSatea.backend.model.album.Album;
import com.AlexiSatea.backend.model.album.AlbumPhoto;
import com.AlexiSatea.backend.model.album.AlbumPhotoId;
import com.AlexiSatea.backend.model.photo.Photo;
import com.AlexiSatea.backend.repo.AlbumPhotoRepository;
import com.AlexiSatea.backend.repo.AlbumRepository;
import com.AlexiSatea.backend.repo.PhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AlbumService {
    private final PhotoRepository photoRepository;
    private final AlbumRepository albumRepository;
    private final AlbumPhotoRepository albumPhotoRepository;


    /*********************   Admin   *********************/
    @Transactional
    public AlbumResponse  createAlbum(String title, AlbumScope scope, String description) {
        // Check
        if (title == null || title.isBlank()) throw new IllegalArgumentException("Title is required");
        if (scope == null) throw new IllegalArgumentException("Scope is required");
        // Build the album instance
        Album album = Album.builder()
                .title(title)
                .scope(scope)
                .description(description)
                .build();
        album = albumRepository.save(album);
        return AlbumResponse.from(album);
    }

    @Transactional
    public void addPhotoToAlbum (UUID photoID,UUID albumID,int position){
        Album album = albumRepository.findById(albumID).orElseThrow(() -> new IllegalArgumentException("Album not found: " + albumID));
        Photo photo = photoRepository.findById(photoID) .orElseThrow(() -> new IllegalArgumentException("Photo not found: " + photoID));
        if (albumPhotoRepository.existsByAlbum_IdAndPhoto_Id(albumID, photoID)) {
            throw new IllegalArgumentException("Photo already in album");
        }
        if (position < 0) {
            position = albumPhotoRepository.findNextPosition(albumID);
        }
        //TODO Reorder the whole album when we chose the position of a photo
        AlbumPhoto relation= AlbumPhoto.builder()
                .photo(photo)
                .album(album)
                .position(position)
                .addedAt(Instant.now())
                .build();
        albumPhotoRepository.save(relation);
    }

    @Transactional
    public AlbumResponse  updateAlbum(UUID id, String title, AlbumScope scope, String description) {
        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Album not found: " + id));

        if (title != null && !title.isBlank()) album.setTitle(title.trim());
        if (scope != null) album.setScope(scope);
        album.setDescription(description);

        albumRepository.save(album);
        return new AlbumResponse(
                album.getId(),
                album.getTitle(),
                album.getDescription()
        );
    }

    @Transactional
    public void deleteAlbum(UUID id) {
        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Album not found: " + id));
        albumRepository.delete(album);
    }

    @Transactional
    public void removePhotoFromAlbum(UUID albumId, UUID photoId) {
        AlbumPhotoId id = new AlbumPhotoId(albumId, photoId);

        if (!albumPhotoRepository.existsById(id)) {
            throw new IllegalArgumentException("Photo is not in this album");
        }
        //TODO Work on the order of other photos in the album after delete
        albumPhotoRepository.deleteById(id);

    }



    /*********************   Homepage(Album)   *********************/
    @Transactional(readOnly = true)
    public List<AlbumViewResponse> getAlbums(AlbumScope scope) {
            List<AlbumViewRow> Rows= albumRepository.findAlbumViews(scope);
        return AlbumViewResponse.from(Rows);
        }


        /*********************   PhotoBrowser(Album)   *********************/
    @Transactional(readOnly = true)
    public Page<AlbumPhotoItem> getAlbumItems(UUID albumId, Pageable pageable){
        Page<AlbumPhoto> relations = albumPhotoRepository.findByAlbumIdWithPhoto(albumId,pageable);
        return AlbumPhotoItem.from(relations);
    }

    @Transactional(readOnly = true)
    public AlbumViewResponse getAlbumDetails(UUID albumId) {
        AlbumViewRow albumDetails = albumRepository.findAlbumViewById(albumId);
        return AlbumViewResponse.from(albumDetails);

    }


    }

