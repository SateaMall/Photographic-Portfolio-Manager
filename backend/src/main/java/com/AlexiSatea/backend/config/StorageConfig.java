package com.AlexiSatea.backend.config;

import com.AlexiSatea.backend.storage.LocalStorageService;
import com.AlexiSatea.backend.storage.StorageService;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(StorageProperties.class)
public class StorageConfig {

    @Bean
    public StorageService storageService(StorageProperties props) {
        // Later: if (props.getType() == S3) return new S3StorageService(...)
        return new LocalStorageService(props.getLocal().getRootPath());
    }
}
