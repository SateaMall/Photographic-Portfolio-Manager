package com.letmelens.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter @Setter
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {

    private StorageType type = StorageType.LOCAL;
    private Local local = new Local();

    public enum StorageType { LOCAL, S3 }

    @Getter @Setter
    public static class Local {
        private String rootPath = "./storage";
    }
}
