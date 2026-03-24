package com.AlexiSatea.backend.controller;

import com.AlexiSatea.backend.dto.PhotoResponse;
import com.AlexiSatea.backend.model.photo.Photo;
import com.AlexiSatea.backend.model.photo.Theme;
import com.AlexiSatea.backend.model.photo.feature.PhotoFeatureType;
import com.AlexiSatea.backend.service.PhotoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/manage/photos")
public class ManagementPhotoController {

    private final PhotoService photoService;


    /**********************************         Photos APIs         ******************************/
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PhotoResponse uploadPhoto(
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) UUID albumId,
            @RequestParam(required = false) List<Theme> themes,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer captureYear,
            Authentication authentication
    ) {
        Photo photo = photoService.uploadPhoto(
                file, albumId, themes, title, description, country, city, captureYear, authentication
        );
        return PhotoResponse.from(photo);
    }

    //Done
    @PutMapping("/{photoId}")
    public PhotoResponse updatePhoto(
            @PathVariable UUID photoId,
            @RequestParam(required = false) List<Theme> themes,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer captureYear,
            @RequestParam(defaultValue = "false") boolean clearCaptureYear,
            Authentication authentication
    ) {
        Photo photo = photoService.updatePhoto(
                photoId, themes, title, description, country, city, captureYear, clearCaptureYear, authentication
        );
        return PhotoResponse.from(photo);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication authentication) {
        photoService.delete(id, authentication);
        return ResponseEntity.noContent().build();
    }

    /**********************************         PhotoFeature APIs         ******************************/
    @PostMapping("/photo-Feature/{id}")
    public Integer addPhotoFeature(
            @PathVariable UUID id,
            @RequestParam(required = false) Integer index,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(required = false) String slug,
            @RequestParam(required = false) PhotoFeatureType type,
            Authentication authentication
    ) {
        return photoService.addUpdatePhotoFeature(id, index,enabled, type, slug, authentication);
    }
    @DeleteMapping("/photo-Feature/{id}")
    public void deletePhotoFeature(
            @PathVariable UUID id,
            @RequestParam(required = false) String slug,
            @RequestParam(required = false) PhotoFeatureType type,
            Authentication authentication
    ) {
        photoService.deletePhotoFeature(id, type, slug, authentication);
    }


}
