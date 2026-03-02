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
@RequestMapping("/api/photos")
public class PublicImageController {

    private final PhotoService photoService;

    @GetMapping("/{id}")
    public PhotoResponse get(@PathVariable UUID id) {
        Photo p = photoService.get(id);
        return PhotoResponse.from(p);
    }


    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> file(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "MEDIUM") PhotoVariant variant
    ) {
        Photo photo = photoService.get(id);
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
