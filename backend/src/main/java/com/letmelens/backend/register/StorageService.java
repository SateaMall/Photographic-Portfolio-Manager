package com.letmelens.backend.register;


import org.springframework.core.io.Resource;

import java.io.InputStream;

public interface StorageService {
    void store(String key, InputStream data, long size, String contentType);
    Resource loadAsResource(String key);
    void delete(String key);
}
