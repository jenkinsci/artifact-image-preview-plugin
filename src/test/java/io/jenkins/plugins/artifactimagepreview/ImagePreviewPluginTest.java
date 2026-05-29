package io.jenkins.plugins.artifactimagepreview;

import hudson.model.PageDecorator;
import org.junit.jupiter.api.Test;
import org.jvnet.hudson.test.JenkinsRule;
import org.jvnet.hudson.test.junit.jupiter.WithJenkins;
import static org.junit.jupiter.api.Assertions.*;

@WithJenkins
class ImagePreviewPluginTest {

    @Test
    void testDisplayName() {
        ImagePreviewPlugin plugin = new ImagePreviewPlugin();
        assertEquals("Image Artifact Preview", plugin.getDisplayName());
    }

    @Test
    void testExtension(JenkinsRule jenkins) {
        assertTrue(PageDecorator.all().stream()
                .anyMatch(d -> d instanceof ImagePreviewPlugin));
    }
}
