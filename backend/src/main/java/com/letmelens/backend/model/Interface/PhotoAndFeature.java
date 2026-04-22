package com.letmelens.backend.model.Interface;

import com.letmelens.backend.model.photo.Photo;
import com.letmelens.backend.model.photo.feature.PhotoFeature;

public interface PhotoAndFeature {
    public Photo  getPhoto();
    public PhotoFeature getPhotoFeature();
}
