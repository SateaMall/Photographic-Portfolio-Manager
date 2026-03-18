package com.AlexiSatea.backend.service;

import com.AlexiSatea.backend.dto.AlbumResponse;
import com.AlexiSatea.backend.dto.MainPhotoResponse;
import com.AlexiSatea.backend.dto.PhotoResponse;
import com.AlexiSatea.backend.model.album.Album;
import com.AlexiSatea.backend.model.album.AlbumPhoto;
import com.AlexiSatea.backend.model.photo.Photo;
import com.AlexiSatea.backend.model.photo.PhotoVariant;
import com.AlexiSatea.backend.model.photo.Theme;
import com.AlexiSatea.backend.model.photo.feature.PhotoFeatureType;
import com.AlexiSatea.backend.model.user.AppUser;
import com.AlexiSatea.backend.repo.*;
import com.AlexiSatea.backend.security.AccessService;
import com.AlexiSatea.backend.security.CurrentUserService;
import com.AlexiSatea.backend.storage.StorageService;
import lombok.RequiredArgsConstructor;
import net.coobird.thumbnailator.Thumbnails;
import org.apache.tomcat.util.http.fileupload.ByteArrayOutputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PhotoService {

    private final PhotoRepository photoRepository;
    private final AlbumRepository albumRepository;
    private final AlbumPhotoRepository albumPhotoRepository;
    private final StorageService storageService;
    private final PhotoFeatureRepository photoFeatureRepository;
    private final AppUserRepository appUserRepository;
    private final CurrentUserService currentUserService;
    private final AccessService accessService;
    private static final Logger logger = LoggerFactory.getLogger(PhotoService.class);

    // We can expand later (HEIC, etc.)
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );
    private static final int MEDIUM_MAX_WIDTH = 1600;
    private static final int THUMB_MAX_WIDTH  = 400;

    private static final float MEDIUM_QUALITY = 0.85f;
    private static final float THUMB_QUALITY  = 0.75f;


    /**********************************         Photo APIs         ******************************/


    @Transactional(readOnly = true)
    public Page <PhotoResponse> getPhotos (String slug,UUID photoId, Pageable pageable){
        if (photoId == null){
            // This is to show photos grid for homepage
        return photoRepository.findFeaturedForProfile(slug, PhotoFeatureType.HOMEPAGE_GRID, pageable)
                .map(r-> PhotoResponse.from(r.getPhoto(),r.getPhotoFeature()));}
        else{
            // This is to show photo suggestions
            Photo p= getPublicPhotoForProfile(photoId, slug);
            List<Theme> themes = photoRepository.findThemesByPhotoId(photoId);
            return  photoRepository.findFeaturedPriorityThemes(slug,PhotoFeatureType.SUGGESTIONS,photoId,themes, !(themes.isEmpty()), p.getCountry(),p.getCity(), pageable)
                    .map(r-> PhotoResponse.from(r.getPhoto(),r.getPhotoFeature()));
        }
    }

    @Transactional
    public Photo uploadPhoto(
            MultipartFile file,
            UUID albumId,
            List<Theme> themes,
            String title,
            String description,
            String country,
            String city,
            Integer captureYear,
            Authentication authentication
    ) {
        //auth
        AppUser currentUser = currentUserService.requireCurrentUser(authentication);
        String originalKey = null;
        String mediumKey = null;
        String thumbKey = null;
        try {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("File is empty");
            }

            String contentType = file.getContentType();
            if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
                throw new IllegalArgumentException("Unsupported content type: " + contentType);
            }

            UUID photoID = UUID.randomUUID();

            ZonedDateTime now = ZonedDateTime.now(ZoneOffset.UTC);
            String basePath = String.format(
                    "users/%s/%04d/%02d/%s",
                    currentUser.getId(),
                    now.getYear(),
                    now.getMonthValue(),
                    photoID
            );

            // ----------- Keys -----------
            originalKey = basePath + "_org";
            mediumKey = basePath + "_md.jpg";
            thumbKey = basePath + "_th.jpg";

            // ----------- Read original once -----------
            BufferedImage originalImage;
            try (InputStream in = file.getInputStream()) {
                originalImage = ImageIO.read(in);
                if (originalImage == null) {
                    throw new IllegalArgumentException("File is not a readable image");
                }
            } catch (IOException e) {
                throw new RuntimeException("Failed to read image", e);
            }

            int width = originalImage.getWidth();
            int height = originalImage.getHeight();

            // ----------- Store original (as-is) -----------
            try {
                storageService.store(
                        originalKey,
                        file.getInputStream(),
                        file.getSize(),
                        contentType
                );
            } catch (IOException e) {
                throw new RuntimeException("Failed storing original image", e);
            }

            // ----------- Generate MEDIUM -----------
            ByteArrayOutputStream mediumOut = new ByteArrayOutputStream();
            try {
                Thumbnails.of(originalImage)
                        .size(MEDIUM_MAX_WIDTH, MEDIUM_MAX_WIDTH)
                        .outputFormat("jpg")
                        .outputQuality(MEDIUM_QUALITY)
                        .toOutputStream(mediumOut);
            } catch (IOException e) {
                throw new RuntimeException("Failed generating medium image", e);
            }

            byte[] mediumBytes = mediumOut.toByteArray();

            storageService.store(
                    mediumKey,
                    new ByteArrayInputStream(mediumBytes),
                    mediumBytes.length,
                    "image/jpeg"
            );

            // ----------- Generate THUMB -----------
            ByteArrayOutputStream thumbOut = new ByteArrayOutputStream();
            try {
                Thumbnails.of(originalImage)
                        .size(THUMB_MAX_WIDTH, THUMB_MAX_WIDTH)
                        .outputFormat("jpg")
                        .outputQuality(THUMB_QUALITY)
                        .toOutputStream(thumbOut);
            } catch (IOException e) {
                throw new RuntimeException("Failed generating thumbnail image", e);
            }

            byte[] thumbBytes = thumbOut.toByteArray();

            storageService.store(
                    thumbKey,
                    new ByteArrayInputStream(thumbBytes),
                    thumbBytes.length,
                    "image/jpeg"
            );

            // ----------- Persist Photo -----------
            Photo photo = Photo.builder()
                    .id(photoID)
                    .author(currentUser)
                    .themes(themes == null ? new ArrayList<>() : new ArrayList<>(themes))

                    // original
                    .originalKey(originalKey)
                    .originalFilename(safeName(file.getOriginalFilename()))
                    .originalContentType(contentType)
                    .originalSizeBytes(file.getSize())

                    // medium
                    .mediumKey(mediumKey)
                    .mediumContentType("image/jpeg")
                    .mediumSizeBytes(mediumBytes.length)

                    // thumb
                    .thumbKey(thumbKey)
                    .thumbContentType("image/jpeg")
                    .thumbSizeBytes(thumbBytes.length)

                    // meta
                    .title(title)
                    .description(description)
                    .country(country)
                    .city(city)
                    .captureYear(captureYear)

                    .width(width)
                    .height(height)
                    .createdAt(Instant.now())
                    .build();

            photo = photoRepository.save(photo);

            // ----------- Album link (unchanged) -----------
            if (albumId != null) {
                Album album = accessService.requireManageableAlbum(currentUser, albumId);
                int position = albumPhotoRepository.findNextPosition(albumId);

                AlbumPhoto relation = AlbumPhoto.builder()
                        .photo(photo)
                        .album(album)
                        .position(position)
                        .addedAt(Instant.now())
                        .build();

                albumPhotoRepository.save(relation);

            }
            return photo;
        } catch (Exception e) {
            deleteQuietly(originalKey);
            deleteQuietly(mediumKey);
            deleteQuietly(thumbKey);
            throw e;
        }
    }
    //Done - to test
    @Transactional
    public Photo updatePhoto (UUID photoId, List<Theme> themes, String title, String description,String country,String city,Integer captureYear, boolean clearCaptureYear,Authentication authentication){
        if (photoId == null) {
            throw new IllegalArgumentException("Photo id is required");
        }
        AppUser currentUser = currentUserService.requireCurrentUser(authentication);
        Photo photo = accessService.requireManageablePhoto(photoId,currentUser.getId());

        if (themes != null) {
            photo.setThemes(new ArrayList<>(themes));
        }

        if (title != null) {
            if (title.isBlank()) {
                throw new IllegalArgumentException("Title cannot be blank");
            }
            photo.setTitle(title.trim());
        }

        if (description != null) {
            photo.setDescription(description.isBlank() ? null : description.trim());
        }
        if (country != null) {
            photo.setCountry(country.isBlank() ? null : country.trim());
        }
        if (city != null) {
            photo.setCity(city.isBlank() ? null : city.trim());
        }
        if (clearCaptureYear) {
            photo.setCaptureYear(null);
        } else if (captureYear != null) {
            photo.setCaptureYear(captureYear);
        }
        photo = photoRepository.save(photo);
        return photo;
    }

    @Transactional(readOnly = true)
    public Photo getPublicPhotoForProfile(UUID id, String slug) {
        return photoRepository.findPublicPhotoForProfile(id,slug)
                .orElseThrow(() -> new IllegalArgumentException("Photo not found: " + id));
    }

    @Transactional(readOnly = true)
    public Photo get(UUID id) {
        return photoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Photo not found: " + id));
    }

    @Transactional(readOnly = true)
    public MainPhotoResponse getPhotoDetails(UUID id, String slug){
        Photo photo = getPublicPhotoForProfile(id, slug);
        return  MainPhotoResponse.from(photo);
    }

    @Transactional(readOnly = true)
    public Resource loadFile(UUID id, PhotoVariant variant) {
        Photo photo = get(id);

        String key = switch (variant) {
            case ORIGINAL -> photo.getOriginalKey();
            case MEDIUM   -> photo.getMediumKey();
            case THUMB    -> photo.getThumbKey();
        };

        return storageService.loadAsResource(key);
    }


    @Transactional
    public void delete(UUID id,Authentication authentication) {
        //auth
        AppUser currentUser = currentUserService.requireCurrentUser(authentication);

        //delete
        Photo photo = get(id);
        if (!photo.getAuthor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not allowed to delete this photo");
        }
        deleteQuietly(photo.getOriginalKey());
        deleteQuietly(photo.getMediumKey());
        deleteQuietly(photo.getThumbKey());

        photoRepository.delete(photo);
    }

    private void deleteQuietly(String key) {
        try {
            storageService.delete(key);
        } catch (Exception e) {
            // log.warn("Failed to delete file {}", key, e);
        }
    }



    private String safeName(String name) {
        if (name == null) return "unknown";
        // remove path parts, keep it simple
        return name.replace("\\", "/").substring(name.lastIndexOf('/') + 1);
    }

    /**********************************         Album-Photo APIs         ******************************/
    public List<UUID> albumIdsOfPhoto( Photo photo) {
        return albumPhotoRepository.findAlbumIdsByPhotoId(photo.getId());
    }


    /**********************************         PhotoFeature APIs         ******************************/
    //TODO
   /*
    @Transactional

    public Integer AddUpdatePhotoFeature(UUID photoId, Integer index, FeatureContext context, Boolean enabled) {
        if (index != null && index < 0) {
            throw new IllegalArgumentException("index must be >= 0");
        }

        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new IllegalArgumentException("Photo not found: " + photoId));

        PhotoFeature pf = photoFeatureRepository
                .findByPhotoIdAndContext(photoId, context)
                .orElseGet(() -> PhotoFeature.builder()
                        .photo(photo)
                        .context(context)
                        .build()
                );

        // if enabled param not sent => default true
        pf.setEnabled(enabled == null || enabled);

        // if index param not sent => keep null or set null if you want to "clear" ordering
        pf.setOrderIndex(index);

        // update timestamp when (re)featured or modified
        pf.setFeaturedAt(Instant.now());

        photoFeatureRepository.save(pf);

        return pf.getOrderIndex();
    }

    public void deletePhotoFeature(UUID photoId, FeatureContext context) {
        PhotoFeature pf = photoFeatureRepository.findByPhotoIdAndContext(photoId, context)
                .orElseThrow(() -> new IllegalArgumentException(
                        "PhotoFeature not found for photoId=" + photoId + ", context=" + context
                ));
        photoFeatureRepository.delete(pf);
    }
  */

}



