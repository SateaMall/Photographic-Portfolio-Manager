package com.letmelens.backend.seo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.HtmlUtils;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;

@Service
public class FrontendShellService {

    private static final String SEO_START_MARKER = "<meta name=\"letmelens-seo-start\" content=\"managed\" />";
    private static final String SEO_END_MARKER = "<meta name=\"letmelens-seo-end\" content=\"managed\" />";
    private static final Duration CACHE_TTL = Duration.ofMinutes(5);

    private final RestClient restClient = RestClient.builder().build();

    @Value("${app.frontend.preview-source-url:${app.frontend.base-url}}")
    private String previewSourceUrl;

    private volatile CachedShell cachedShell;

    public String render(PublicPageMetadata metadata) {
        String shellHtml = rewriteRootRelativeUrls(loadShellHtml());
        return replaceSeoBlock(shellHtml, buildSeoBlock(metadata));
    }

    public FrontendAsset loadAsset(String assetPath) {
        String assetUrl = previewSourceOrigin() + ensureLeadingSlash(assetPath);
        ResponseEntity<byte[]> response = restClient
                .get()
                .uri(assetUrl)
                .retrieve()
                .toEntity(byte[].class);

        byte[] body = response.getBody();
        if (body == null || body.length == 0) {
            throw new IllegalStateException("Frontend asset is empty: " + assetUrl);
        }

        MediaType contentType = response.getHeaders().getContentType();
        return new FrontendAsset(body, contentType != null ? contentType.toString() : MediaType.APPLICATION_OCTET_STREAM_VALUE);
    }

    private String loadShellHtml() {
        CachedShell currentCache = cachedShell;
        if (currentCache != null && currentCache.expiresAt().isAfter(Instant.now())) {
            return currentCache.html();
        }

        String sourceUrl = normalizePreviewSourceUrl(previewSourceUrl);
        try {
            String html = restClient
                    .get()
                    .uri(sourceUrl)
                    .retrieve()
                    .body(String.class);

            if (!StringUtils.hasText(html)) {
                throw new IllegalStateException("Frontend shell is empty.");
            }

            cachedShell = new CachedShell(html, Instant.now().plus(CACHE_TTL));
            return html;
        } catch (RuntimeException exception) {
            if (currentCache != null) {
                return currentCache.html();
            }

            throw new IllegalStateException("Failed to load frontend shell from " + sourceUrl, exception);
        }
    }

    private String normalizePreviewSourceUrl(String value) {
        String trimmed = value.trim();
        if (trimmed.endsWith(".html")) {
            return trimmed;
        }

        return trimmed.endsWith("/") ? trimmed : trimmed + "/";
    }

    private String rewriteRootRelativeUrls(String html) {
        String origin = previewSourceOrigin();

        return html
                .replace(" href=\"/", " href=\"" + origin + "/")
                .replace(" src=\"/", " src=\"" + origin + "/")
                .replace(" content=\"/", " content=\"" + origin + "/");
    }

    private String replaceSeoBlock(String html, String seoBlock) {
        int startIndex = html.indexOf(SEO_START_MARKER);
        int endIndex = html.indexOf(SEO_END_MARKER);

        if (startIndex >= 0 && endIndex > startIndex) {
            return html.substring(0, startIndex) + seoBlock + html.substring(endIndex + SEO_END_MARKER.length());
        }

        int headCloseIndex = html.indexOf("</head>");
        if (headCloseIndex < 0) {
            return seoBlock + html;
        }

        return html.substring(0, headCloseIndex) + seoBlock + html.substring(headCloseIndex);
    }

    private String buildSeoBlock(PublicPageMetadata metadata) {
        String title = escape(metadata.title());
        String description = escape(metadata.description());
        String canonicalUrl = escape(metadata.canonicalUrl());
        String robots = escape(metadata.robots());
        String ogType = escape(metadata.ogType());
        String imageUrl = escape(metadata.imageUrl());
        String imageAlt = escape(metadata.imageAlt());

        return """
                <meta name="letmelens-seo-start" content="managed" />
                <title>%s</title>
                <meta name="description" content="%s" />
                <link rel="canonical" href="%s" />
                <meta name="robots" content="%s" />
                <meta property="og:locale" content="en_US" />
                <meta property="og:type" content="%s" />
                <meta property="og:site_name" content="Let Me Lens" />
                <meta property="og:title" content="%s" />
                <meta property="og:description" content="%s" />
                <meta property="og:url" content="%s" />
                <meta property="og:image" content="%s" />
                <meta property="og:image:alt" content="%s" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="%s" />
                <meta name="twitter:description" content="%s" />
                <meta name="twitter:image" content="%s" />
                <meta name="twitter:image:alt" content="%s" />
                <meta name="letmelens-seo-end" content="managed" />
                """.formatted(
                title,
                description,
                canonicalUrl,
                robots,
                ogType,
                title,
                description,
                canonicalUrl,
                imageUrl,
                imageAlt,
                title,
                description,
                imageUrl,
                imageAlt
        );
    }

    private String escape(String value) {
        return HtmlUtils.htmlEscape(value == null ? "" : value);
    }

    private String previewSourceOrigin() {
        URI sourceUri = URI.create(normalizePreviewSourceUrl(previewSourceUrl));
        return sourceUri.getScheme() + "://" + sourceUri.getAuthority();
    }

    private String ensureLeadingSlash(String value) {
        return value.startsWith("/") ? value : "/" + value;
    }

    private record CachedShell(String html, Instant expiresAt) {
    }

    public record FrontendAsset(byte[] body, String contentType) {
    }
}
