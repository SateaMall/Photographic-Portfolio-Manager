package com.letmelens.backend.dto;

import com.letmelens.backend.model.Interface.AlbumViewRow;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public record AlbumViewResponse (
        UUID albumId,
        UUID firstPhotoId,
        String title,
        String description,
        Integer numberOfPhotos
)
{
    public static List<AlbumViewResponse> from (List<AlbumViewRow> Rows){
        List<AlbumViewResponse> list = new ArrayList<>();

        for(AlbumViewRow row:Rows){
            int count = row.getNumberOfPhotos() == null ? 0 : row.getNumberOfPhotos();
            list.add(new AlbumViewResponse(row.getAlbumId(),row.getFirstPhotoId(),row.getTitle(), row.getDescription(), count));
        }
        return list;
    }

    public static AlbumViewResponse from (AlbumViewRow albumView)
    {
        int count = albumView.getNumberOfPhotos() == null ? 0 : albumView.getNumberOfPhotos();
        return  new AlbumViewResponse(albumView.getAlbumId(),albumView.getFirstPhotoId(),albumView.getTitle(), albumView.getDescription(), count);
    }
}
