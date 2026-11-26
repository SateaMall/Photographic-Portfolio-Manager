package com.letmelens.backend.seo;

public record PublicPageMetadata(
        String title,
        String description,
        String canonicalUrl,
        String robots,
        String ogType,
        String imageUrl,
        String imageAlt,
        // Only known for the default site image; null for photo previews
        String imageType,
        Integer imageWidth,
        Integer imageHeight
) {
}
