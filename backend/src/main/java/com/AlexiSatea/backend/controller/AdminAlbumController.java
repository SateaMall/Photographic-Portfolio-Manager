package com.AlexiSatea.backend.controller;

import com.AlexiSatea.backend.dto.AlbumResponse;
import com.AlexiSatea.backend.service.AlbumService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/albums")
public class AdminAlbumController {

    private final AlbumService albumService;
    @PostMapping
    public AlbumResponse  createAlbum(
            @RequestParam String title,
            //@RequestParam AlbumScope scope,
            @RequestParam(required = false) String description
    ) {
        throw new UnsupportedOperationException("Endpoint not implemented yet");
        //return albumService.createAlbum(title, scope, description);
    }
    @PutMapping("/{id}")
    public AlbumResponse  updateAlbum(
            @RequestParam UUID id,
            @RequestParam String title,
            //@RequestParam AlbumScope scope,
            @RequestParam(required = false) String description
    ) {
        throw new UnsupportedOperationException("Endpoint not implemented yet");
        //return albumService.updateAlbum(id, title, scope, description);
    }
    @PostMapping("/{albumId}/photos/{photoId}")
    public void addPhotoToAlbum (
            @RequestParam UUID photoID,
            @RequestParam UUID albumID,
            @RequestParam(required = false) int position
    ){
        throw new UnsupportedOperationException("Endpoint not implemented yet");
        //albumService.addPhotoToAlbum(photoID, albumID, position);
    }
    @DeleteMapping("/{id}")
    public void  DeleteAlbum (
            @RequestParam UUID id
    ){
        throw new UnsupportedOperationException("Endpoint not implemented yet");
        //albumService.deleteAlbum(id);
    }
    @DeleteMapping("/{albumId}/photos/{photoId}")
    public void removePhotoFromAlbum(
            @PathVariable UUID albumId,
            @PathVariable UUID photoId
    ) {
        throw new UnsupportedOperationException("Endpoint not implemented yet");
        //albumService.removePhotoFromAlbum(albumId, photoId);
    }

}
