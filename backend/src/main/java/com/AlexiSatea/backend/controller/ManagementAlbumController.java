package com.AlexiSatea.backend.controller;

import com.AlexiSatea.backend.dto.AlbumResponse;
import com.AlexiSatea.backend.service.AlbumService;

import jakarta.websocket.server.PathParam;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/manage/albums")
public class ManagementAlbumController {

    private final AlbumService albumService;
//Done - to test
    @PostMapping
    public AlbumResponse createAlbum(
            @RequestParam String slug,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            Authentication authentication
    ) {
        return albumService.createAlbum(slug, title, description, authentication);
    }

    //Done - to test
    @PutMapping("/{albumId}")
    public AlbumResponse  updateAlbum(
            @PathVariable UUID albumId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            Authentication authentication
    ) {
        return albumService.updateAlbum(albumId, title, description, authentication);
    }

    //Done - to test
    @PostMapping("/{albumId}/photos/{photoId}")
    public ResponseEntity<Void> addPhotoToAlbum(
            @PathVariable UUID albumId,
            @PathVariable UUID photoId,
            @RequestParam(required = false) Integer position,
            Authentication authentication
    ) {
        albumService.addPhotoToAlbum(photoId, albumId, position, authentication);
        return ResponseEntity.noContent().build();
    }

    //Done - to test
    @DeleteMapping("/{albumId}")
    public ResponseEntity<Void>  deleteAlbum (
            @PathVariable UUID albumId,
            Authentication authentication
    ){
        albumService.deleteAlbum(albumId,authentication);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{albumId}/photos/{photoId}")
    public  ResponseEntity<Void> removePhotoFromAlbum(
            @PathVariable UUID albumId,
            @PathVariable UUID photoId,
            Authentication authentication
    ) {
        albumService.removePhotoFromAlbum(albumId, photoId, authentication);
        return ResponseEntity.noContent().build();
    }

}
