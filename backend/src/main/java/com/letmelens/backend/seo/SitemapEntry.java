package com.letmelens.backend.seo;

import java.time.Instant;
import java.util.List;

public record SitemapEntry(String url, Instant lastModified, List<String> imageUrls) {
}
