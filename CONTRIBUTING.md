# Contributing

Thanks for your interest in the Artifact Image Preview plugin.

## Build and test

Requirements: JDK 17+ (21 or 25 recommended), Maven 3.8+.

```bash
git clone https://github.com/jenkinsci/artifact-image-preview-plugin.git
cd artifact-image-preview-plugin
mvn clean verify
```

## Pull requests

1. Open a PR against `main`.
2. Wait for [ci.jenkins.io](https://ci.jenkins.io/job/Plugins/job/artifact-image-preview-plugin/) and GitHub Actions (including the Jenkins Security Scan) to pass.
3. Add a label before merge so release notes and CD releases are categorized correctly, for example:
   - `enhancement` — user-visible improvement
   - `bug` — bug fix
   - `chore` or `dependencies` — maintenance only (does not trigger a release by itself)

See the [release drafter categories](https://github.com/jenkinsci/.github/blob/master/.github/release-drafter.yml) for the full list.

## Releases

This plugin uses [Jenkins CD](https://www.jenkins.io/doc/developer/publishing/releasing-cd/). Merging labeled PRs to `main` can trigger automatic releases after CI succeeds. Version numbers look like `17.v44ef18c19254` (commit count + git hash), not semantic `1.x.y`.

## Reporting issues

Use [GitHub Issues](https://github.com/jenkinsci/artifact-image-preview-plugin/issues). Include Jenkins version, plugin version, and steps to reproduce.

## Code of conduct

This project follows the [Jenkins project Code of Conduct](https://www.jenkins.io/project/conduct/).
