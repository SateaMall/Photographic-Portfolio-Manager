package com.letmelens.backend.seo;

public record PublicPageMetadata(
        String title,
        String description,
        String canonicalUrl,
        String robots,
        String ogType,
        String imageUrl,
        String imageAlt
) {
}
