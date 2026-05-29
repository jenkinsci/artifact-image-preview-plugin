# Jenkins 图片 Artifact 预览插件

[![Jenkins Plugin](https://img.shields.io/badge/Jenkins-Plugin-blue)](https://plugins.jenkins.io/artifact-image-preview)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[English](README.md)

一个 Jenkins 插件，在构建页面自动为图片 Artifact 添加缩略图预览和悬停放大功能。

## 演示

![悬停预览演示](docs/demo-hover-preview.gif)

## 功能

- **缩略图预览** — 自动在图片 Artifact 链接旁显示缩略图
- **悬停放大** — 鼠标悬停缩略图弹出大图预览
- **GIF 动画** — GIF 文件显示橙色边框和 "GIF" 标签，悬停自动播放动画
- **点击打开** — 点击缩略图在新标签页打开原图
- **格式支持** — PNG、JPG/JPEG、GIF、WebP、SVG、BMP
- **零配置** — 安装后自动生效
- **轻量** — 纯 CSS + 原生 JS，通过 `PageDecorator` 注入，无外部依赖

## 截图

| 缩略图 | 悬停预览 | GIF 悬停 |
|:---:|:---:|:---:|
| ![缩略图](docs/screenshot-thumbnails.png) | ![悬停](docs/screenshot-hover-preview.png) | ![GIF](docs/screenshot-gif-hover.png) |

## 工作原理

1. `ImagePreviewPlugin` 继承 `PageDecorator` → Jenkins 将 `header.jelly` 注入每个页面
2. JS 扫描 `<a href*="artifact/">` 链接，按图片扩展名过滤
3. 在每个链接后插入 `<img>` 缩略图；GIF 文件添加橙色边框 + "GIF" 标签
4. `mouseenter`/`mousemove` 显示固定弹窗；`mouseleave` 隐藏
5. `MutationObserver` 处理动态加载内容

## 环境要求

- Jenkins 2.440.3+
- Java 11+
- Maven 3.8+

## 构建与安装

```bash
mvn clean package -DskipTests
```

通过 **Manage Jenkins → Plugins → Advanced → Upload Plugin** 上传 `target/artifact-image-preview.hpi`，然后重启 Jenkins。

或手动复制到 `$JENKINS_HOME/plugins/` 并重启。

## 许可证

[MIT](LICENSE)
