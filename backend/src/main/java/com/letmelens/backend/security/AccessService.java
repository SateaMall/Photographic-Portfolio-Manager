package com.letmelens.backend.security;

import com.letmelens.backend.model.album.Album;
import com.letmelens.backend.model.photo.Photo;
import com.letmelens.backend.model.profile.Profile;
import com.letmelens.backend.model.user.AppUser;
import com.letmelens.backend.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component  // @Service?
@RequiredArgsConstructor
public class AccessService {
    private final AlbumRepository albumRepository;
    private final AppUserRepository userRepository;
    private final ProfileUserRepository profileUserRepository;
    private final PhotoRepository photoRepository;
    private final ProfileRepository profileRepository;

    public Photo requireManageablePhoto(UUID userId, UUID photoId) {
        Photo photo = photoRepository.findById(photoId) .orElseThrow(() -> new IllegalArgumentException("Photo not found: " + photoId));
        if (!photo.getAuthor().getId().equals(userId)) {
            throw new AccessDeniedException("You are not allowed to manage this photo");
        }
        return photo;
    }


    public Album requireManageableAlbum(AppUser user, UUID albumId) {
        if (user == null) {
            throw new AccessDeniedException("Unauthenticated user");
        }
        if (albumId == null) {
            throw new IllegalArgumentException("Album is required");
        }
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new IllegalArgumentException("Album not found: " + albumId));

        boolean allowed = profileUserRepository.existsByProfile_IdAndUser_Id(
                album.getOwnerProfile().getId(),
                user.getId()
        );
        if (!allowed) {
            throw new AccessDeniedException("You are not allowed to modify this album");
        }
        return album;
    }


    public void checkUserCanManageProfile(UUID userId, UUID profileId) {

        boolean allowed = profileUserRepository
                .existsByProfile_IdAndUser_Id(profileId, userId);

        if (!allowed) {
            throw new AccessDeniedException("You cannot manage this profile");
        }
    }

    public Profile requireManageableProfile(UUID userId, String slug) {
        Profile profile= profileRepository.findBySlug(slug).orElseThrow(() -> new IllegalArgumentException("Profile not found: " + slug));
        checkUserCanManageProfile(userId, profile.getId());
        return profile;
    }

}
