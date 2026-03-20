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
        AppUser currentUser = currentUserService.requireCurrentUser(authentication);

        String originalKey = null;
        String mediumKey = null;
        String thumbKey = null;

        try {
            validateUploadInputs(file, title, captureYear);

            String originalFilename = safeName(file.getOriginalFilename());
            String detectedContentType = file.getContentType();
            String normalizedContentType = normalizeContentType(detectedContentType, originalFilename);

            validateSupportedImageType(normalizedContentType, originalFilename);

            UUID photoId = UUID.randomUUID();
            Instant now = Instant.now();

            String basePath = buildPhotoBasePath(currentUser.getId(), photoId);
            originalKey = basePath + "_org";
            mediumKey = basePath + "_md.jpg";
            thumbKey = basePath + "_th.jpg";

            BufferedImage originalImage = readImage(file);

            int width = originalImage.getWidth();
            int height = originalImage.getHeight();

            storeOriginal(file, originalKey, normalizedContentType);

            byte[] mediumBytes = generateJpegVariant(originalImage, MEDIUM_MAX_WIDTH, MEDIUM_QUALITY);
            storageService.store(
                    mediumKey,
                    new ByteArrayInputStream(mediumBytes),
                    mediumBytes.length,
                    "image/jpeg"
            );

            byte[] thumbBytes = generateJpegVariant(originalImage, THUMB_MAX_WIDTH, THUMB_QUALITY);
            storageService.store(
                    thumbKey,
                    new ByteArrayInputStream(thumbBytes),
                    thumbBytes.length,
                    "image/jpeg"
            );

            Photo photo = Photo.builder()
                    .id(photoId)
                    .author(currentUser)
                    .themes(themes == null ? new ArrayList<>() : new ArrayList<>(themes))

                    .originalKey(originalKey)
                    .originalFilename(originalFilename)
                    .originalContentType(normalizedContentType)
                    .originalSizeBytes(file.getSize())

                    .mediumKey(mediumKey)
                    .mediumContentType("image/jpeg")
                    .mediumSizeBytes(mediumBytes.length)

                    .thumbKey(thumbKey)
                    .thumbContentType("image/jpeg")
                    .thumbSizeBytes(thumbBytes.length)

                    .title(title == null ? null : title.trim())
                    .description(description == null ? null : description.trim())
                    .country(country)
                    .city(city)
                    .captureYear(captureYear)

                    .width(width)
                    .height(height)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();

            photo = photoRepository.save(photo);

            if (albumId != null) {
                Album album = accessService.requireManageableAlbum(currentUser, albumId);
                int position = albumPhotoRepository.findNextPosition(albumId);

                AlbumPhoto relation = AlbumPhoto.builder()
                        .photo(photo)
                        .album(album)
                        .position(position)
                        .addedAt(now)
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
    private void validateUploadInputs(MultipartFile file, String title, Integer captureYear) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (captureYear != null && (captureYear < 1800 || captureYear > 2100)) {
            throw new IllegalArgumentException("Capture year must be between 1800 and 2100");
        }
    }
    private void validateSupportedImageType(String contentType, String filename) {
        boolean allowedMimeType = contentType != null && ALLOWED_CONTENT_TYPES.contains(contentType);
        boolean allowedExtension = hasAllowedImageExtension(filename);

        if (!allowedMimeType && !allowedExtension) {
            throw new IllegalArgumentException(
                    "Unsupported file type. Content type: " + contentType + ", filename: " + filename
            );
        }
    }
    private boolean hasAllowedImageExtension(String filename) {
        if (filename == null || filename.isBlank()) {
            return false;
        }

        String lower = filename.toLowerCase(Locale.ROOT);
        return lower.endsWith(".jpg")
                || lower.endsWith(".jpeg")
                || lower.endsWith(".png")
                || lower.endsWith(".webp");
    }
    private String normalizeContentType(String contentType, String filename) {
        if (contentType != null && !contentType.isBlank() && !"application/octet-stream".equals(contentType)) {
            return contentType;
        }

        if (filename == null || filename.isBlank()) {
            return "application/octet-stream";
        }

        String lower = filename.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        if (lower.endsWith(".png")) {
            return "image/png";
        }
        if (lower.endsWith(".webp")) {
            return "image/webp";
        }

        return "application/octet-stream";
    }
    private BufferedImage readImage(MultipartFile file) {
        try (InputStream in = file.getInputStream()) {
            BufferedImage image = ImageIO.read(in);
            if (image == null) {
                throw new IllegalArgumentException("File is not a readable image");
            }
            return image;
        } catch (IOException e) {
            throw new RuntimeException("Failed to read image", e);
        }
    }
    private void storeOriginal(MultipartFile file, String originalKey, String contentType) {
        try (InputStream in = file.getInputStream()) {
            storageService.store(
                    originalKey,
                    in,
                    file.getSize(),
                    contentType
            );
        } catch (IOException e) {
            throw new RuntimeException("Failed storing original image", e);
        }
    }
    private byte[] generateJpegVariant(BufferedImage source, int maxWidth, double quality) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Thumbnails.of(source)
                    .size(maxWidth, maxWidth)
                    .outputFormat("jpg")
                    .outputQuality(quality)
                    .toOutputStream(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed generating image variant", e);
        }
    }
    private String buildPhotoBasePath(UUID userId, UUID photoId) {
        ZonedDateTime now = ZonedDateTime.now(ZoneOffset.UTC);
        return String.format(
                "users/%s/%04d/%02d/%s",
                userId,
                now.getYear(),
                now.getMonthValue(),
                photoId
        );
    }
    //Done - to test
    @Transactional
    public Photo updatePhoto (UUID photoId, List<Theme> themes, String title, String description,String country,String city,Integer captureYear, boolean clearCaptureYear,Authentication authentication){
        if (photoId == null) {
            throw new IllegalArgumentException("Photo id is required");
        }
        AppUser currentUser = currentUserService.requireCurrentUser(authentication);
        Photo photo = accessService.requireManageablePhoto(currentUser.getId(),photoId);

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



