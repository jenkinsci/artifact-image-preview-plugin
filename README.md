# Artifact Image Preview Plugin for Jenkins

[![Jenkins Plugin](https://img.shields.io/badge/Jenkins-Plugin-blue)](https://plugins.jenkins.io/artifact-image-preview)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[中文文档](README_zh.md)

Image artifact thumbnails and hover-to-zoom preview on job and build pages. Install and use — no configuration.

## Demo

![Hover Preview Demo](docs/demo-hover-preview.gif)

## Features

- Thumbnails on job page (*Last Successful Artifacts*) and build page (*Build Artifacts*)
- Hover a thumbnail for a large popup preview
- GIF files: orange border, **GIF** badge, auto-play in popup
- Click a thumbnail to open the full image in a new tab
- PNG, JPG/JPEG, GIF, WebP

## Screenshots

| Build Page | Job Page (Hover) | Build Page (Hover, Dark) |
|:---:|:---:|:---:|
| ![Build page](docs/screenshot-build-page.png) | ![Job page hover](docs/screenshot-job-hover.png) | ![Build page hover dark](docs/screenshot-build-hover-dark.png) |

## Install

Upload `artifact-image-preview.hpi` via **Manage Jenkins → Plugins → Advanced → Upload Plugin**, then restart.

Build from source:

```bash
mvn clean verify
```

## License

[MIT](LICENSE)
