package com.AlexiSatea.backend.security;

import com.AlexiSatea.backend.model.album.Album;
import com.AlexiSatea.backend.model.photo.Photo;
import com.AlexiSatea.backend.model.profile.Profile;
import com.AlexiSatea.backend.model.user.AppUser;
import com.AlexiSatea.backend.repo.AlbumRepository;
import com.AlexiSatea.backend.repo.AppUserRepository;
import com.AlexiSatea.backend.repo.PhotoRepository;
import com.AlexiSatea.backend.repo.ProfileUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Component  // @Service?
@RequiredArgsConstructor
public class AccessService {
    private final AlbumRepository albumRepository;
    private final AppUserRepository userRepository;
    private final ProfileUserRepository profileUserRepository;
    private final PhotoRepository photoRepository;

    public void checkUserCanManagePhoto(AppUser user, Photo photo) {
        if (!photo.getAuthor().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not allowed to manage this photo");
        }
    }

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



    public void checkAuthCanManageProfile(Authentication authentication, UUID profileId) {
        String email = authentication.getName();

        AppUser user = userRepository.findByEmail(email)
                .orElseThrow();

        boolean allowed = profileUserRepository
                .existsByProfile_IdAndUser_Id(profileId, user.getId());

        if (!allowed) {
            throw new AccessDeniedException("You cannot manage this profile");
        }
    }

    public void checkUserCanManageProfile(UUID userId, UUID profileId) {

        boolean allowed = profileUserRepository
                .existsByProfile_IdAndUser_Id(profileId, userId);

        if (!allowed) {
            throw new AccessDeniedException("You cannot manage this profile");
        }
    }
}