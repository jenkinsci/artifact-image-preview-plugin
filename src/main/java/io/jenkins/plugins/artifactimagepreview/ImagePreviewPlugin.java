package io.jenkins.plugins.artifactimagepreview;

import hudson.Extension;
import hudson.model.Job;
import hudson.model.PageDecorator;
import org.kohsuke.stapler.Ancestor;
import org.kohsuke.stapler.Stapler;
import org.kohsuke.stapler.StaplerRequest2;

@Extension
public class ImagePreviewPlugin extends PageDecorator {

    public ImagePreviewPlugin() {
        super();
    }

    @Override
    public String getDisplayName() {
        return "Image Artifact Preview";
    }

    public boolean isOnJobPage() {
        StaplerRequest2 request = Stapler.getCurrentRequest2();
        if (request == null) {
            return false;
        }
        Ancestor ancestor = request.findAncestor(Job.class);
        return ancestor != null && ancestor.getObject() instanceof Job<?, ?>;
    }
}
