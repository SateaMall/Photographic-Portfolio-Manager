package com.AlexiSatea.backend.controller;

import com.AlexiSatea.backend.dto.MainPhotoResponse;
import com.AlexiSatea.backend.dto.PhotoResponse;
import com.AlexiSatea.backend.service.PhotoService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/public")
public class PublicPhotoController {

    final PhotoService photoService;
    final Logger logger = LoggerFactory.getLogger(PublicPhotoController.class);

    /** front-end : fetchMainPhoto **/
    /** Modified **/
    @GetMapping("/profiles/{slug}/photos/{photoId}")
    public MainPhotoResponse photoDetails(@PathVariable String slug,
                                          @PathVariable UUID photoId) {
        return photoService.getPhotoDetails(photoId, slug);
    }

    /** front-end : fetchPhotos **/
    /** Modified **/
    @GetMapping("/profiles/{slug}/photos")
    public Page<PhotoResponse> getPhotos(
            @PathVariable String slug,
            @RequestParam(required = false) UUID photoId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        return photoService.getPhotos(slug, photoId, pageable);
    }
}
