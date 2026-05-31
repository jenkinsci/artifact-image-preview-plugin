package io.jenkins.plugins.artifactimagepreview;

import hudson.model.FreeStyleProject;
import hudson.model.PageDecorator;
import hudson.tasks.ArtifactArchiver;
import org.htmlunit.html.HtmlPage;
import org.junit.jupiter.api.Test;
import org.jvnet.hudson.test.CreateFileBuilder;
import org.jvnet.hudson.test.JenkinsRule;
import org.jvnet.hudson.test.MockFolder;
import org.jvnet.hudson.test.junit.jupiter.WithJenkins;
import static org.junit.jupiter.api.Assertions.*;

@WithJenkins
class ImagePreviewPluginTest {

    private static final String ADJUNCT_MARKER = "adjuncts/image-preview";

    private static boolean hasAdjunct(HtmlPage page) {
        return page.getWebResponse().getContentAsString().contains(ADJUNCT_MARKER);
    }

    private static void assertAdjunct(JenkinsRule jenkins, String path, boolean expected, String note) throws Exception {
        HtmlPage page = jenkins.createWebClient().goTo(path);
        assertEquals(expected, hasAdjunct(page), () -> "adjunct on " + path + " (" + note + ")");
    }

    private static FreeStyleProject projectWithArchivedArtifact(JenkinsRule jenkins, String name) throws Exception {
        FreeStyleProject project = jenkins.createFreeStyleProject(name);
        project.getBuildersList().add(new CreateFileBuilder("artifact/readme.txt", "ok"));
        project.getPublishersList().add(new ArtifactArchiver("artifact/**"));
        jenkins.buildAndAssertSuccess(project);
        return project;
    }

    @Test
    void testDisplayName() {
        assertEquals("Image Artifact Preview", new ImagePreviewPlugin().getDisplayName());
    }

    @Test
    void testExtension(JenkinsRule jenkins) {
        assertTrue(PageDecorator.all().stream()
                .anyMatch(d -> d instanceof ImagePreviewPlugin));
    }

    @Test
    void testIsOnJobPageWithoutRequest() {
        assertFalse(new ImagePreviewPlugin().isOnJobPage());
    }

    @Test
    void adjunctLoadedOnJobSubTreePages(JenkinsRule jenkins) throws Exception {
        projectWithArchivedArtifact(jenkins, "preview-test");

        assertAdjunct(jenkins, "job/preview-test/", true, "job overview");
        assertAdjunct(jenkins, "job/preview-test/configure", true, "job configure");
        assertAdjunct(jenkins, "job/preview-test/1/", true, "build page");
        assertAdjunct(jenkins, "job/preview-test/ws/", true, "workspace");
        assertAdjunct(jenkins, "job/preview-test/1/artifact/artifact/", true, "artifact browser");
    }

    @Test
    void adjunctNotLoadedOffJobPages(JenkinsRule jenkins) throws Exception {
        jenkins.createFreeStyleProject("preview-test");

        assertAdjunct(jenkins, "manage", false, "Manage Jenkins");
        assertAdjunct(jenkins, "userContent/", false, "userContent");
        assertAdjunct(jenkins, "pluginManager/", false, "plugin manager");
        assertAdjunct(jenkins, "", false, "dashboard");
    }

    @Test
    void adjunctLoadedOnJobNestedInFolder(JenkinsRule jenkins) throws Exception {
        MockFolder folder = jenkins.createProject(MockFolder.class, "folder-a");
        FreeStyleProject nested = folder.createProject(FreeStyleProject.class, "nested-job");
        jenkins.buildAndAssertSuccess(nested);

        assertAdjunct(jenkins, "job/folder-a/job/nested-job/", true, "job inside folder");
        assertAdjunct(jenkins, "job/folder-a/job/nested-job/1/", true, "build inside folder");
    }

    @Test
    void adjunctNotLoadedOnFolderOverview(JenkinsRule jenkins) throws Exception {
        MockFolder folder = jenkins.createProject(MockFolder.class, "folder-a");
        folder.createProject(FreeStyleProject.class, "nested-job");

        assertAdjunct(jenkins, "job/folder-a/", false, "folder overview is not a Job");
    }
}
