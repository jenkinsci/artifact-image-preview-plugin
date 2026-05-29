package io.jenkins.plugins.artifactimagepreview;

import hudson.model.PageDecorator;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ImagePreviewPluginTest {

    @Test
    void testDisplayName() {
        ImagePreviewPlugin plugin = new ImagePreviewPlugin();
        assertEquals("Image Artifact Preview", plugin.getDisplayName());
    }

    @Test
    void testExtension() {
        assertTrue(PageDecorator.all().stream()
                .anyMatch(d -> d instanceof ImagePreviewPlugin));
    }
}
