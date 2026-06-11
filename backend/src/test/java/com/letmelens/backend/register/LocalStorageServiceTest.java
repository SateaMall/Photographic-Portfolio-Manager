package com.letmelens.backend.register;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;

class LocalStorageServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void storesAndLoadsFile() throws Exception {
        LocalStorageService storageService = new LocalStorageService(tempDir.toString());
        String key = "photos/test.txt";
        String content = "hello photo gallery";

        storageService.store(
                key,
                new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8)),
                content.length(),
                "text/plain"
        );

        Resource resource = storageService.loadAsResource(key);
        String loaded;
        try (InputStream inputStream = resource.getInputStream()) {
            loaded = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        }
        assertEquals(content, loaded);
    }
}
