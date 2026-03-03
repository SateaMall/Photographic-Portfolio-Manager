package com.AlexiSatea.backend.controller;

import com.AlexiSatea.backend.dto.AlbumPhotoItem;
import com.AlexiSatea.backend.dto.AlbumResponse;
import com.AlexiSatea.backend.dto.AlbumViewResponse;
import com.AlexiSatea.backend.service.AlbumService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/public")
public class PublicAlbumController {
    private final AlbumService albumService;

    /** OK **/
    @GetMapping("/albums/{albumId}")
    public AlbumViewResponse albumDetails(@PathVariable UUID albumId) {
        return albumService.getAlbumDetails(albumId);
    }


    /** OK **/
    @GetMapping("/albums/{albumId}/items")
    public Page<AlbumPhotoItem> albumItemsList (
            @PathVariable UUID albumId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return albumService.getAlbumItems(albumId,pageable);
    }

    /** Modified **/
    @GetMapping("/profiles/{profileSlug}/albums")
    public List<AlbumViewResponse> getAlbums(@PathVariable String profileSlug) {
        return albumService.getAlbums(profileSlug);
    }

}
