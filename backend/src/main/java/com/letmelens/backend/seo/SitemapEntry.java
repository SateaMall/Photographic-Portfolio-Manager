package com.letmelens.backend.seo;

import java.time.Instant;

public record SitemapEntry(String url, Instant lastModified) {
}
