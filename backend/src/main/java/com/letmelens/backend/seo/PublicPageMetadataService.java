package com.letmelens.backend.seo;

import com.letmelens.backend.dto.AlbumViewResponse;
import com.letmelens.backend.dto.MainPhotoResponse;
import com.letmelens.backend.dto.PhotoResponse;
import com.letmelens.backend.dto.PublicProfileResponse;
import com.letmelens.backend.repo.ProfileRepository;
import com.letmelens.backend.service.AlbumService;
import com.letmelens.backend.service.PhotoService;
import com.letmelens.backend.service.ProfileUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PublicPageMetadataService {

    private static final String SITE_NAME = "Let Me Lens";
    private static final String SITE_DESCRIPTION = "Let Me Lens empowers photographers to share what matters to them.";
    private static final String SITE_IMAGE_PATH = "/preview/default-image";
    private static final String DEFAULT_OG_TYPE = "website";
    private static final String INDEX_ROBOTS = "index,follow";
    private static final String NO_INDEX_ROBOTS = "noindex,nofollow";

    private final ProfileUserService profileUserService;
    private final PhotoService photoService;
    private final AlbumService albumService;
    private final ProfileRepository profileRepository;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String siteBaseUrl;

    public PublicPageMetadata homePage() {
        return page(
                SITE_NAME,
                SITE_DESCRIPTION,
                "/",
                INDEX_ROBOTS,
                buildPublicUrl(SITE_IMAGE_PATH),
                "Let Me Lens preview"
        );
    }

    public PublicPageMetadata privacyPage() {
        return page(
                "Privacy Notice | Let Me Lens",
                "Privacy information for Let Me Lens.",
                "/privacy",
                INDEX_ROBOTS,
                buildPublicUrl(SITE_IMAGE_PATH),
                "Let Me Lens preview"
        );
    }

    public PublicPageMetadata authPage(String title, String path) {
        return page(
                title,
                SITE_DESCRIPTION,
                path,
                NO_INDEX_ROBOTS,
                buildPublicUrl(SITE_IMAGE_PATH),
                "Let Me Lens preview"
        );
    }

    public PublicPageMetadata managePage(String slug) {
        return page(
                "Studio | Let Me Lens",
                "Manage your Let Me Lens portfolio.",
                "/" + normalizePathSegment(slug) + "/manage",
                NO_INDEX_ROBOTS,
                buildPublicUrl(SITE_IMAGE_PATH),
                "Let Me Lens preview"
        );
    }

    public PublicPageMetadata missingPage(String title, String path) {
        return page(
                title,
                SITE_DESCRIPTION,
                path,
                NO_INDEX_ROBOTS,
                buildPublicUrl(SITE_IMAGE_PATH),
                "Let Me Lens preview"
        );
    }

    @Transactional(readOnly = true)
    public Optional<PublicPageMetadata> profilePage(String slug) {
        Optional<PublicProfileResponse> maybeProfile = profileUserService.getPublicProfile(slug);
        if (maybeProfile.isEmpty()) {
            return Optional.empty();
        }

        PublicProfileResponse profile = maybeProfile.get();
        String profileName = displayName(profile);
        String profileSlug = profile.slug();

        return Optional.of(page(
                profileName + " | Let Me Lens",
                buildProfileDescription(profileName, profile.bio()),
                "/" + normalizePathSegment(profileSlug),
                INDEX_ROBOTS,
                resolveProfileImageUrl(profileSlug),
                "Preview image from " + profileName + "'s portfolio"
        ));
    }

    @Transactional(readOnly = true)
    public Optional<PublicPageMetadata> albumPage(String slug, UUID albumId) {
        Optional<PublicProfileResponse> maybeProfile = profileUserService.getPublicProfile(slug);
        if (maybeProfile.isEmpty()) {
            return Optional.empty();
        }

        PublicProfileResponse profile = maybeProfile.get();
        String profileSlug = profile.slug();
        String profileName = displayName(profile);
        Optional<AlbumViewResponse> maybeAlbum = albumService.getAlbums(profileSlug).stream()
                .filter(album -> albumId.equals(album.albumId()))
                .findFirst();

        if (maybeAlbum.isEmpty()) {
            return Optional.empty();
        }

        AlbumViewResponse album = maybeAlbum.get();
        String albumTitle = trimToNull(album.title());
        String collectionLabel = albumTitle != null ? albumTitle : "Collection";

        return Optional.of(page(
                collectionLabel + " | " + profileName + " | Let Me Lens",
                buildAlbumDescription(collectionLabel, profileName, album.description()),
                "/" + normalizePathSegment(profileSlug) + "/album/" + encodePathSegment(albumId.toString()),
                INDEX_ROBOTS,
                album.firstPhotoId() != null ? buildPhotoImageUrl(profileSlug, album.firstPhotoId()) : resolveProfileImageUrl(profileSlug),
                "Preview image from the " + collectionLabel + " collection"
        ));
    }

    @Transactional(readOnly = true)
    public Optional<PublicPageMetadata> photoPage(String slug, UUID photoId) {
        Optional<PublicProfileResponse> maybeProfile = profileUserService.getPublicProfile(slug);
        if (maybeProfile.isEmpty()) {
            return Optional.empty();
        }

        PublicProfileResponse profile = maybeProfile.get();
        String profileSlug = profile.slug();
        String profileName = displayName(profile);

        try {
            MainPhotoResponse photo = photoService.getPhotoDetails(photoId, profileSlug);
            String photoTitle = trimToNull(photo.title());

            return Optional.of(page(
                    photoTitle != null
                            ? photoTitle + " | " + profileName + " | Let Me Lens"
                            : "Photo by " + profileName + " | Let Me Lens",
                    buildPhotoDescription(photo, profileName),
                    "/" + normalizePathSegment(profileSlug) + "/photo/" + encodePathSegment(photoId.toString()),
                    INDEX_ROBOTS,
                    buildPhotoImageUrl(profileSlug, photoId),
                    photoTitle != null ? photoTitle : "Photo by " + profileName
            ));
        } catch (IllegalArgumentException exception) {
            return Optional.empty();
        }
    }

    @Transactional(readOnly = true)
    public List<SitemapEntry> sitemapEntries() {
        List<SitemapEntry> entries = new ArrayList<>();
        entries.add(new SitemapEntry(buildPublicUrl("/"), null));

        profileRepository.findAllByIsPublicTrueOrderByUpdatedAtDesc().forEach(profile -> entries.add(
                new SitemapEntry(
                        buildPublicUrl("/" + normalizePathSegment(profile.getSlug())),
                        profile.getUpdatedAt()
                )
        ));

        return entries;
    }

    public String robotsTxt() {
        return "User-agent: *\n"
                + "Allow: /\n"
                + "Sitemap: " + buildPublicUrl("/sitemap.xml") + "\n";
    }

    private String resolveProfileImageUrl(String profileSlug) {
        List<PhotoResponse> heroPhotos = photoService.getHeroPhotos(profileSlug);
        if (!heroPhotos.isEmpty()) {
            return buildPhotoImageUrl(profileSlug, heroPhotos.get(0).id());
        }

        return photoService.getPhotos(profileSlug, null, PageRequest.of(0, 1)).stream()
                .findFirst()
                .map(photo -> buildPhotoImageUrl(profileSlug, photo.id()))
                .orElseGet(() -> buildPublicUrl(SITE_IMAGE_PATH));
    }

    private PublicPageMetadata page(
            String title,
            String description,
            String path,
            String robots,
            String imageUrl,
            String imageAlt
    ) {
        return new PublicPageMetadata(
                normalizeText(title),
                truncateDescription(description),
                buildPublicUrl(path),
                robots,
                DEFAULT_OG_TYPE,
                imageUrl,
                normalizeText(imageAlt)
        );
    }

    private String buildProfileDescription(String profileName, String bio) {
        String normalizedBio = trimToNull(bio);
        if (normalizedBio != null) {
            return normalizedBio;
        }

        return "Explore the photography portfolio of " + profileName + " on Let Me Lens.";
    }

    private String buildAlbumDescription(String collectionLabel, String profileName, String description) {
        String normalizedDescription = trimToNull(description);
        if (normalizedDescription != null) {
            return normalizedDescription;
        }

        return "Explore the " + collectionLabel + " collection by " + profileName + " on Let Me Lens.";
    }

    private String buildPhotoDescription(MainPhotoResponse photo, String profileName) {
        String normalizedDescription = trimToNull(photo.description());
        if (normalizedDescription != null) {
            return normalizedDescription;
        }

        List<String> locationParts = new ArrayList<>();
        String city = trimToNull(photo.city());
        String country = trimToNull(photo.country());
        if (city != null) {
            locationParts.add(city);
        }
        if (country != null) {
            locationParts.add(country);
        }
        if (photo.captureYear() != null) {
            locationParts.add(String.valueOf(photo.captureYear()));
        }

        if (!locationParts.isEmpty()) {
            return "Discover a photograph by " + profileName + " captured in " + String.join(", ", locationParts) + ".";
        }

        return "Discover a photograph by " + profileName + " on Let Me Lens.";
    }

    private String buildPhotoImageUrl(String profileSlug, UUID photoId) {
        return UriComponentsBuilder.fromUriString(normalizedSiteBaseUrl())
                .path("/api/public/profiles/{slug}/photos/{photoId}/file")
                .queryParam("variant", "MEDIUM")
                .buildAndExpand(normalizePathSegment(profileSlug), photoId)
                .toUriString();
    }

    private String buildPublicUrl(String path) {
        String normalizedPath = path.startsWith("/") ? path : "/" + path;
        return UriComponentsBuilder.fromUriString(normalizedSiteBaseUrl())
                .path(normalizedPath)
                .toUriString();
    }

    private String normalizedSiteBaseUrl() {
        return siteBaseUrl.endsWith("/") ? siteBaseUrl.substring(0, siteBaseUrl.length() - 1) : siteBaseUrl;
    }

    private String displayName(PublicProfileResponse profile) {
        String displayName = trimToNull(profile.displayName());
        return displayName != null ? displayName : profile.slug();
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim().replaceAll("\\s+", " ");
    }

    private String truncateDescription(String value) {
        String normalized = normalizeText(value);
        if (normalized.length() <= 180) {
            return normalized;
        }

        int boundary = normalized.lastIndexOf(' ', 177);
        if (boundary < 120) {
            boundary = 177;
        }

        return normalized.substring(0, boundary).trim() + "...";
    }

    private String normalizePathSegment(String value) {
        return encodePathSegment(normalizeText(value).toLowerCase());
    }

    private String encodePathSegment(String value) {
        return UriUtils.encodePathSegment(value, StandardCharsets.UTF_8);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String normalized = normalizeText(value);
        return normalized.isBlank() ? null : normalized;
    }
}
