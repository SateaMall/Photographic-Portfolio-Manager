package com.AlexiSatea.backend.controller;


import com.AlexiSatea.backend.dto.PhotoResponse;
import com.AlexiSatea.backend.model.photo.PhotoVariant;
import com.AlexiSatea.backend.model.photo.Photo;
import com.AlexiSatea.backend.service.PhotoService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/public")
public class PublicImageController {

    private final PhotoService photoService;

    /** front-end: fetchAlbumInfo */
    @GetMapping("/profiles/{slug}/photos/{id}/summary")
    public PhotoResponse getPhotoSummary(@PathVariable String slug, @PathVariable UUID id) {
        Photo p = photoService.getPublicPhotoForProfile(id, slug);
        return PhotoResponse.from(p);
    }

    /** front-end: photoFileUrl */
    @GetMapping("/profiles/{slug}/photos/{id}/file")
    public ResponseEntity<Resource> file(
            @PathVariable String slug,
            @PathVariable UUID id,
            @RequestParam(defaultValue = "MEDIUM") PhotoVariant variant
    ) {
        Photo photo = photoService.getPublicPhotoForProfile(id, slug); // validates access
        Resource resource = photoService.loadFile(id, variant);

        String contentType = switch (variant) {
            case ORIGINAL -> photo.getOriginalContentType();
            case MEDIUM   -> photo.getMediumContentType();
            case THUMB    -> photo.getThumbContentType();
        };

        // Only use filename for ORIGINAL (others are derivatives)
        String contentDisposition = (variant == PhotoVariant.ORIGINAL)
                ? "inline; filename*=UTF-8''" +
                UriUtils.encode(photo.getOriginalFilename(), StandardCharsets.UTF_8)
                : "inline";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .cacheControl(CacheControl.maxAge(365, java.util.concurrent.TimeUnit.DAYS).cachePublic())
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                .body(resource);
    }

}
