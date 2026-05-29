package io.jenkins.plugins.artifactimagepreview;

import hudson.Extension;
import hudson.model.PageDecorator;

@Extension
public class ImagePreviewPlugin extends PageDecorator {

    public ImagePreviewPlugin() {
        super();
    }

    @Override
    public String getDisplayName() {
        return "Image Artifact Preview";
    }
}
