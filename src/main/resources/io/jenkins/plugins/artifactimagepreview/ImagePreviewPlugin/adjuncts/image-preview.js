(function(d) {
    'use strict';
    var popup = null;
    var popupImg = null;
    var popupLabel = null;
    var DIRECTORY_BROWSER_MODEL = 'hudson.model.DirectoryBrowserSupport';
    var IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp)(?:[?#].*)?$/i;
    var ANIMATED_EXTS = /\.(gif)(?:[?#].*)?$/i;

    function ensurePopup() {
        if (popup) return;
        popup = d.createElement('div');
        popup.className = 'img-preview-popup';
        popupImg = d.createElement('img');
        popup.appendChild(popupImg);
        popupLabel = d.createElement('span');
        popupLabel.className = 'gif-label';
        popup.appendChild(popupLabel);
        d.body.appendChild(popup);
    }

    function isDirectoryBrowserPage() {
        return d.body && d.body.dataset && d.body.dataset.modelType === DIRECTORY_BROWSER_MODEL;
    }

    function isArtifactPath(pathname) {
        return pathname.indexOf('/artifact/') !== -1;
    }

    function isArtifactDirectoryBrowserPage() {
        return isDirectoryBrowserPage() && isArtifactPath(window.location.pathname);
    }

    function resolveSafeHttpUrl(link) {
        var href = link.getAttribute('href');
        if (!href) return null;

        var url;
        try {
            url = new URL(href, document.baseURI);
        } catch (e) {
            return null;
        }

        if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
        return url;
    }

    function isSupportedImagePath(pathname) {
        return IMAGE_EXTENSIONS.test(pathname);
    }

    function getArtifactImageUrl(link) {
        var url = resolveSafeHttpUrl(link);
        if (!url) return null;
        if (!isSupportedImagePath(url.pathname)) return null;

        if (isArtifactDirectoryBrowserPage()) {
            return url.href;
        }

        if (isArtifactPath(url.pathname)) {
            return url.href;
        }

        return null;
    }

    function isAnimatedUrl(url) {
        return ANIMATED_EXTS.test(url);
    }

    function positionPopup(x, y) {
        var w = popup.offsetWidth;
        var h = popup.offsetHeight;
        var left = Math.min(x + 15, window.innerWidth - w - 10);
        var top = Math.min(y + 15, window.innerHeight - h - 10);
        popup.style.left = Math.max(10, left) + 'px';
        popup.style.top = Math.max(10, top) + 'px';
    }

    function showPopup(src, x, y, isAnimated) {
        ensurePopup();
        popupImg.src = src;
        popupLabel.textContent = isAnimated ? 'GIF' : '';
        popupLabel.style.display = isAnimated ? 'block' : 'none';
        popup.style.display = 'block';
        positionPopup(x, y);
    }

    function hidePopup() {
        if (popup) popup.style.display = 'none';
    }

    function getArtifactListRows(scope) {
        var root = scope || d;
        var rows = [];
        root.querySelectorAll('table.fileList tr').forEach(function(row) {
            if (row.querySelector('a[href$="/*view*/"]')) {
                rows.push(row);
            }
        });
        return rows;
    }

    function getArtifactFileLink(row) {
        var links = row.querySelectorAll('a[href]:not([href$="/*view*/"])');
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (link.dataset.ip) continue;
            var href = link.getAttribute('href');
            if (!href || href.indexOf('/*zip*/') !== -1) continue;
            var label = (link.textContent || '').trim();
            if (label === '(all files in zip)') continue;
            return link;
        }
        return null;
    }

    function processLink(link, row) {
        if (link.dataset.ip) return;
        var artifactImageUrl = getArtifactImageUrl(link);
        if (!artifactImageUrl) return;

        row = row || link.closest('tr');
        var cell = link.closest('td');
        var viewLink = row && row.querySelector('a[href$="/*view*/"]');
        var viewCell = viewLink && viewLink.closest('td');
        if (!cell || !row || !viewCell || row.dataset.ipPreview) return;

        var animated = isAnimatedUrl(artifactImageUrl);

        var thumbCell = d.createElement('td');
        thumbCell.className = 'img-preview-cell';

        var thumb = d.createElement('img');
        thumb.className = 'img-preview-thumb' + (animated ? ' is-gif' : '');
        thumb.src = artifactImageUrl;
        thumb.alt = 'Preview';
        thumb.title = animated ? 'GIF preview' : 'Preview';
        thumb.loading = 'lazy';
        thumb.decoding = 'async';
        thumb.referrerPolicy = 'no-referrer';
        thumb.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.open(artifactImageUrl, '_blank');
        });
        thumb.addEventListener('mouseenter', function(e) { showPopup(artifactImageUrl, e.clientX, e.clientY, animated); });
        thumb.addEventListener('mousemove', function(e) { showPopup(artifactImageUrl, e.clientX, e.clientY, animated); });
        thumb.addEventListener('mouseleave', hidePopup);
        thumbCell.appendChild(thumb);
        row.insertBefore(thumbCell, viewCell.nextSibling);
        link.dataset.ip = '1';
        row.dataset.ipPreview = '1';
    }

    function scanArtifactLinks(root) {
        getArtifactListRows(root).forEach(function(row) {
            var link = getArtifactFileLink(row);
            if (link) processLink(link, row);
        });
    }

    function init() {
        scanArtifactLinks(d);
        window.setTimeout(function() {
            scanArtifactLinks(d);
        }, 1000);
    }

    if (d.readyState === 'loading') {
        d.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(document);
