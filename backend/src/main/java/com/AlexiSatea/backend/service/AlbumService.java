package com.AlexiSatea.backend.service;

import com.AlexiSatea.backend.dto.AlbumPhotoItem;
import com.AlexiSatea.backend.dto.AlbumResponse;
import com.AlexiSatea.backend.dto.AlbumViewResponse;
import com.AlexiSatea.backend.model.Interface.AlbumViewRow;
import com.AlexiSatea.backend.model.album.Album;
import com.AlexiSatea.backend.model.album.AlbumPhoto;
import com.AlexiSatea.backend.model.album.AlbumPhotoId;
import com.AlexiSatea.backend.model.photo.Photo;
import com.AlexiSatea.backend.model.profile.Profile;
import com.AlexiSatea.backend.model.user.AppUser;
import com.AlexiSatea.backend.repo.*;
import com.AlexiSatea.backend.security.AccessService;
import com.AlexiSatea.backend.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
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
    private final CurrentUserService currentUserService;
    private final ProfileRepository profileRepository;
    private final AccessService accessService;
    /*********************   Admin   *********************/
    //Done
    @Transactional
    public AlbumResponse createAlbum(
            String slug,
            String title,
            String description,
            Authentication authentication
    )  {
        if (slug == null) {
            throw new IllegalArgumentException("Profile id is required");
        }

        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Title is required");
        }
        AppUser currentUser = currentUserService.requireCurrentUser(authentication);
        Profile profile = profileRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

        accessService.checkUserCanManageProfile(currentUser.getId(), profile.getId());

        Album album = Album.builder()
                .ownerProfile(profile)
                .createdBy(currentUser)
                .title(title)
                .description(description)
                .isPublic(true)
                .build();

        album = albumRepository.save(album);
        return AlbumResponse.from(album);
    }

    //Done
    @Transactional
    public void addPhotoToAlbum(
            UUID photoId,
            UUID albumId,
            Integer position,
            Authentication authentication
    ) {
        if (photoId == null) {
            throw new IllegalArgumentException("Photo id is required");
        }
        if (albumId == null) {
            throw new IllegalArgumentException("Album id is required");
        }
        AppUser currentUser = currentUserService.requireCurrentUser(authentication);

        Album album = accessService.requireManageableAlbum(currentUser, albumId);

        Photo photo= accessService.requireManageablePhoto(currentUser.getId(), photoId);

        if (albumPhotoRepository.existsByAlbum_IdAndPhoto_Id(albumId, photoId)) {
            throw new IllegalArgumentException("Photo already in album");
        }
        int size = albumPhotoRepository.countByAlbum_Id(albumId);

        int finalPosition;
        if (position == null || position < 0 || position > size) {
            finalPosition = size; // append
        } else {
            finalPosition = position;
            albumPhotoRepository.shiftPositionsRight(albumId, finalPosition);
        }

        AlbumPhoto relation = AlbumPhoto.builder()
                .photo(photo)
                .album(album)
                .position(finalPosition)
                .build();

        albumPhotoRepository.save(relation);
    }

    //Done
    @Transactional
    public AlbumResponse updateAlbum(
            UUID id,
            String title,
            String description,
            Authentication authentication
    ) {

        if (id == null) {
            throw new IllegalArgumentException("Album id is required");
        }

        AppUser currentUser = currentUserService.requireCurrentUser(authentication);

        Album album = accessService.requireManageableAlbum(currentUser, id);


        if (title != null) {
            if (title.isBlank()) {
                throw new IllegalArgumentException("Title cannot be blank");
            }
            album.setTitle(title.trim());
        }

        if (description != null) {
            album.setDescription(description.isBlank() ? null : description.trim());
        }
        album = albumRepository.save(album);

        return AlbumResponse.from(album);
    }

    //Done
    @Transactional
    public void deleteAlbum(UUID albumId, Authentication authentication) {
        AppUser currentUser = currentUserService.requireCurrentUser(authentication);
        Album album = accessService.requireManageableAlbum(currentUser, albumId);
        albumRepository.delete(album);
    }

    //Done
    @Transactional
    public void removePhotoFromAlbum(UUID albumId, UUID photoId,  Authentication authentication) {
        AppUser currentUser = currentUserService.requireCurrentUser(authentication);
        accessService.requireManageableAlbum(currentUser, albumId);

        AlbumPhotoId id = new AlbumPhotoId(albumId, photoId);
        AlbumPhoto albumPhoto = albumPhotoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Photo is not in this album"));
        int deletedPosition = albumPhoto.getPosition();
        albumPhotoRepository.deleteById(id);
        albumPhotoRepository.shiftPositionsLeft(albumId, deletedPosition);

    }


    /*********************   Homepage(Album)   *********************/
    @Transactional(readOnly = true)
    public List<AlbumViewResponse> getAlbums(String profileSlug) {
            List<AlbumViewRow> rows = albumRepository.findAlbumViews(profileSlug);
        return AlbumViewResponse.from(rows);
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

