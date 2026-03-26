package com.AlexiSatea.backend.model.Interface;

import com.AlexiSatea.backend.model.photo.Photo;
import com.AlexiSatea.backend.model.photo.feature.PhotoFeature;

public interface PhotoAndFeature {
    public Photo  getPhoto();
    public PhotoFeature getPhotoFeature();
}
