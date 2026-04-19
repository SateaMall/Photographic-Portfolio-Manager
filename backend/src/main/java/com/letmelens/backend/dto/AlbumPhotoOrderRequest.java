package com.letmelens.backend.dto;

import java.util.List;
import java.util.UUID;

public record AlbumPhotoOrderRequest(List<UUID> photoIds) {
}
