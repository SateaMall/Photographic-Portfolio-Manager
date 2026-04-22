package com.letmelens.backend.register;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;

public class LocalStorageService implements StorageService {

    private final Path root;

    public LocalStorageService(String rootPath) {
        this.root = Paths.get(rootPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.root);
        } catch (IOException e) {
            throw new RuntimeException("Could not create storage directory: " + this.root, e);
        }
    }

    @Override
    public void store(String key, InputStream data, long size, String contentType) {
        Path dest = resolveKeyToPath(key);
        try {
            Files.createDirectories(dest.getParent());
            // Replace if exists (idempotent is ok in some flows)
            Files.copy(data, dest, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed storing file for key=" + key, e);
        }
    }

    @Override
    public Resource loadAsResource(String key) {
        Path file = resolveKeyToPath(key);
        try {
            Resource res = new UrlResource(file.toUri());
            if (!res.exists() || !res.isReadable()) {
                throw new RuntimeException("File not found/readable for key=" + key);
            }
            return res;
        } catch (MalformedURLException e) {
            throw new RuntimeException("Bad file URL for key=" + key, e);
        }
    }

    @Override
    public void delete(String key) {
        Path file = resolveKeyToPath(key);
        try {
            Files.deleteIfExists(file);
        } catch (IOException e) {
            throw new RuntimeException("Failed deleting file for key=" + key, e);
        }
    }

    private Path resolveKeyToPath(String key) {
        // Prevent path traversal: key must stay within root
        Path resolved = root.resolve(key).normalize();
        if (!resolved.startsWith(root)) {
            throw new IllegalArgumentException("Invalid storage key (path traversal attempt): " + key);
        }
        return resolved;
    }
}
