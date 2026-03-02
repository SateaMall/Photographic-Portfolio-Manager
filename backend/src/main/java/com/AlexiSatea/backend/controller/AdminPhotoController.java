package com.AlexiSatea.backend.controller;

import com.AlexiSatea.backend.dto.PhotoResponse;
import com.AlexiSatea.backend.model.Enum.FeatureContext;
import com.AlexiSatea.backend.model.Enum.Owner;
import com.AlexiSatea.backend.model.photo.Photo;
import com.AlexiSatea.backend.model.photo.Theme;
import com.AlexiSatea.backend.service.PhotoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/photos")
public class AdminPhotoController {

    private final PhotoService photoService;


    /**********************************         Photos APIs         ******************************/
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PhotoResponse upload(
            @RequestPart("file") MultipartFile file,
            @RequestParam Owner owner,
            @RequestParam(required = false) UUID albumId,
            @RequestParam(required = false) List<Theme> themes
    ) {
        Photo photo = photoService.upload(file, owner, albumId,themes);
        return PhotoResponse.from(photo);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        photoService.delete(id);
    }



    /**********************************         PhotoFeature APIs         ******************************/
    @PostMapping("/photo-Feature/{id}")
    public Integer addPhotoFeature(
            @PathVariable UUID id,
            @RequestParam FeatureContext context,
            @RequestParam(required = false) Integer index,
            @RequestParam(required = false) Boolean enabled
    ) {
        return photoService.AddUpdatePhotoFeature(id, index, context,enabled);
    }
    @DeleteMapping("/photo-Feature/{id}")
    public void deletePhotoFeature(
            @PathVariable UUID id,
            @RequestParam FeatureContext context
    ) {
        photoService.deletePhotoFeature(id, context);
    }


}
