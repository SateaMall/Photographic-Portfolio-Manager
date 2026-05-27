package com.letmelens.backend.controller;

import com.letmelens.backend.seo.FrontendShellService;
import com.letmelens.backend.seo.PublicPageMetadata;
import com.letmelens.backend.seo.PublicPageMetadataService;
import com.letmelens.backend.seo.SitemapEntry;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.util.HtmlUtils;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class PublicSiteController {

    private static final MediaType HTML_UTF8 = new MediaType("text", "html", StandardCharsets.UTF_8);
    private static final MediaType TEXT_UTF8 = new MediaType("text", "plain", StandardCharsets.UTF_8);

    private final FrontendShellService frontendShellService;
    private final PublicPageMetadataService publicPageMetadataService;

    @ResponseBody
    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> homePage() {
        return renderPage(HttpStatus.OK, publicPageMetadataService.homePage());
    }

    @ResponseBody
    @GetMapping(value = "/privacy", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> privacyPage() {
        return renderPage(HttpStatus.OK, publicPageMetadataService.privacyPage());
    }

    @ResponseBody
    @GetMapping(value = "/login", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> loginPage() {
        return renderPage(HttpStatus.OK, publicPageMetadataService.authPage("Login | Let Me Lens", "/login"));
    }

    @ResponseBody
    @GetMapping(value = "/signup", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> signupPage() {
        return renderPage(HttpStatus.OK, publicPageMetadataService.authPage("Sign Up | Let Me Lens", "/signup"));
    }

    @ResponseBody
    @GetMapping(value = "/forgot-password", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> forgotPasswordPage() {
        return renderPage(HttpStatus.OK, publicPageMetadataService.authPage("Forgot Password | Let Me Lens", "/forgot-password"));
    }

    @ResponseBody
    @GetMapping(value = "/reset-password", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> resetPasswordPage() {
        return renderPage(HttpStatus.OK, publicPageMetadataService.authPage("Reset Password | Let Me Lens", "/reset-password"));
    }

    @ResponseBody
    @GetMapping(value = "/verify-email", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> verifyEmailPage() {
        return renderPage(HttpStatus.OK, publicPageMetadataService.authPage("Verify Email | Let Me Lens", "/verify-email"));
    }

    @ResponseBody
    @GetMapping(value = "/preview/default-image")
    public ResponseEntity<byte[]> defaultPreviewImage() {
        FrontendShellService.FrontendAsset asset = frontendShellService.loadAsset("/letmelensHQ.png");
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(asset.contentType()))
                .body(asset.body());
    }

    @ResponseBody
    @GetMapping(value = {"/{slug}/manage", "/{slug}/manage/{*path}"}, produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> managePage(@PathVariable String slug) {
        return renderPage(HttpStatus.OK, publicPageMetadataService.managePage(slug));
    }

    @ResponseBody
    @GetMapping(value = "/{slug}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> profilePage(@PathVariable String slug) {
        return publicPageMetadataService.profilePage(slug)
                .map(metadata -> renderPage(HttpStatus.OK, metadata))
                .orElseGet(() -> renderPage(
                        HttpStatus.NOT_FOUND,
                        publicPageMetadataService.missingPage("Profile Not Found | Let Me Lens", "/" + slug)
                ));
    }

    @ResponseBody
    @GetMapping(value = "/{slug}/album/{albumId}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> albumPage(@PathVariable String slug, @PathVariable UUID albumId) {
        return publicPageMetadataService.albumPage(slug, albumId)
                .map(metadata -> renderPage(HttpStatus.OK, metadata))
                .orElseGet(() -> renderPage(
                        HttpStatus.NOT_FOUND,
                        publicPageMetadataService.missingPage(
                                "Collection Not Found | Let Me Lens",
                                "/" + slug + "/album/" + albumId
                        )
                ));
    }

    @ResponseBody
    @GetMapping(value = "/{slug}/photo/{photoId}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> photoPage(@PathVariable String slug, @PathVariable UUID photoId) {
        return renderPhotoPage(slug, photoId);
    }

    @ResponseBody
    @GetMapping(value = "/{slug}/album/{albumId}/photo/{photoId}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> albumPhotoPage(
            @PathVariable String slug,
            @PathVariable UUID albumId,
            @PathVariable UUID photoId
    ) {
        return renderPhotoPage(slug, photoId);
    }

    @ResponseBody
    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> robotsTxt() {
        return ResponseEntity.ok()
                .contentType(TEXT_UTF8)
                .body(publicPageMetadataService.robotsTxt());
    }

    @ResponseBody
    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> sitemapXml() {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_XML)
                .body(buildSitemapXml(publicPageMetadataService.sitemapEntries()));
    }

    private ResponseEntity<String> renderPhotoPage(String slug, UUID photoId) {
        return publicPageMetadataService.photoPage(slug, photoId)
                .map(metadata -> renderPage(HttpStatus.OK, metadata))
                .orElseGet(() -> renderPage(
                        HttpStatus.NOT_FOUND,
                        publicPageMetadataService.missingPage(
                                "Photo Not Found | Let Me Lens",
                                "/" + slug + "/photo/" + photoId
                        )
                ));
    }

    private ResponseEntity<String> renderPage(HttpStatus status, PublicPageMetadata metadata) {
        return ResponseEntity.status(status)
                .contentType(HTML_UTF8)
                .body(frontendShellService.render(metadata));
    }

    private String buildSitemapXml(List<SitemapEntry> entries) {
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        for (SitemapEntry entry : entries) {
            xml.append("  <url>\n");
            xml.append("    <loc>").append(escapeXml(entry.url())).append("</loc>\n");
            Instant lastModified = entry.lastModified();
            if (lastModified != null) {
                xml.append("    <lastmod>").append(lastModified).append("</lastmod>\n");
            }
            xml.append("  </url>\n");
        }

        xml.append("</urlset>");
        return xml.toString();
    }

    private String escapeXml(String value) {
        return HtmlUtils.htmlEscape(value == null ? "" : value);
    }
}
