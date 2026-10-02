package com.letmelens.backend.controller;

import com.letmelens.backend.seo.FrontendShellService;
import com.letmelens.backend.seo.PublicPageMetadataService;
import com.letmelens.backend.seo.SitemapEntry;
import org.junit.jupiter.api.Test;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PublicSiteControllerTest {

    private static final String SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";
    private static final String IMAGE_NS = "http://www.google.com/schemas/sitemap-image/1.1";

    @Test
    void sitemapIncludesImagesForEachEntry() throws Exception {
        PublicPageMetadataService metadataService = mock(PublicPageMetadataService.class);
        when(metadataService.sitemapEntries()).thenReturn(List.of(
                new SitemapEntry("https://example.com/", null, List.of()),
                new SitemapEntry(
                        "https://example.com/jane/album/1",
                        Instant.parse("2026-01-01T00:00:00Z"),
                        List.of(
                                "https://example.com/api/public/profiles/jane/photos/a/file?variant=MEDIUM",
                                "https://example.com/api/public/profiles/jane/photos/b/file?variant=MEDIUM"
                        )
                )
        ));
        PublicSiteController controller = new PublicSiteController(mock(FrontendShellService.class), metadataService);

        String xml = controller.sitemapXml().getBody();

        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        Document document = factory.newDocumentBuilder()
                .parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));

        assertEquals(2, document.getElementsByTagNameNS(SITEMAP_NS, "url").getLength());
        NodeList imageLocations = document.getElementsByTagNameNS(IMAGE_NS, "loc");
        assertEquals(2, imageLocations.getLength());
        assertEquals(
                "https://example.com/api/public/profiles/jane/photos/a/file?variant=MEDIUM",
                imageLocations.item(0).getTextContent()
        );
    }
}
