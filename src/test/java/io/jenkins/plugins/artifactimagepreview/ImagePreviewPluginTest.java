package io.jenkins.plugins.artifactimagepreview;

import hudson.Extension;
import hudson.model.PageDecorator;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ImagePreviewPluginTest {

    @Test
    void testDisplayName() {
        assertEquals("Image Artifact Preview", new ImagePreviewPlugin().getDisplayName());
    }

    @Test
    void testExtensionMetadata() {
        assertTrue(PageDecorator.class.isAssignableFrom(ImagePreviewPlugin.class));
        assertTrue(ImagePreviewPlugin.class.isAnnotationPresent(Extension.class));
    }
}
