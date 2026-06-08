(function(d) {
    'use strict';
    var popup = null;
    var popupMedia = null;
    var popupLabel = null;
    var mediaCache = Object.create(null); // url -> media element
    var currentUrl = null;
    var hideTimer = null;
    var HIDE_DELAY_MS = 350;
    var POPUP_GAP = 8;
    var DIRECTORY_BROWSER_MODEL = 'hudson.model.DirectoryBrowserSupport';
    var IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|webm)(?:[?#].*)?$/i;
    var VIDEO_EXTS = /\.(webm)(?:[?#].*)?$/i;

    function ensurePopup() {
        if (popup) return;
        popup = d.createElement('div');
        popup.className = 'img-preview-popup';
        popupMedia = d.createElement('div');
        popupMedia.className = 'img-preview-popup-media';
        popup.appendChild(popupMedia);
        popupLabel = d.createElement('span');
        popupLabel.className = 'img-preview-label';
        popup.appendChild(popupLabel);
        d.body.appendChild(popup);

        // mouseenter/mouseleave on the popup itself: do not bubble, so they fire
        // only when the cursor truly enters/leaves the popup (not when moving
        // between child elements like the video control bar).
        popup.addEventListener('mouseenter', cancelHide);
        popup.addEventListener('mouseleave', scheduleHide);
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

    function isVideoUrl(url) {
        return VIDEO_EXTS.test(url);
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

    function positionPopupForThumb(thumb) {
        if (!popup || !thumb) return;
        var r = thumb.getBoundingClientRect();
        // measure after content is in the DOM
        var pw = popup.offsetWidth;
        var ph = popup.offsetHeight;
        var vh = window.innerHeight;
        var vw = window.innerWidth;
        var left, top;

        // prefer right of thumb, flip left if no room
        if (r.right + POPUP_GAP + pw <= vw - 10) {
            left = r.right + POPUP_GAP;
        } else if (r.left - POPUP_GAP - pw >= 10) {
            left = r.left - POPUP_GAP - pw;
        } else {
            // fallback: right side, clamped
            left = Math.min(r.right + POPUP_GAP, vw - pw - 10);
        }
        left = Math.max(10, left);

        // vertically center on thumb, clamp to viewport
        top = r.top + r.height / 2 - ph / 2;
        top = Math.max(10, Math.min(top, vh - ph - 10));

        popup.style.left = left + 'px';
        popup.style.top = top + 'px';
    }

    function buildMediaElement(url, isVideo) {
        var el;
        if (isVideo) {
            el = d.createElement('video');
            el.src = url;
            el.autoplay = true;
            el.loop = true;
            el.muted = true;
            el.controls = true;
            el.playsInline = true;
            el.preload = 'auto';
        } else {
            el = d.createElement('img');
            el.src = url;
        }
        return el;
    }

    function attachMedia(url, isVideo) {
        var el = mediaCache[url];
        if (!el) {
            el = buildMediaElement(url, isVideo);
            mediaCache[url] = el;
        }
        if (popupMedia.firstChild !== el) {
            while (popupMedia.firstChild) popupMedia.removeChild(popupMedia.firstChild);
            popupMedia.appendChild(el);
        }
        return el;
    }

    function showPopup(thumb, url, isVideo) {
        ensurePopup();
        if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }
        if (currentUrl !== url) {
            attachMedia(url, isVideo);
            currentUrl = url;
            popupMedia.className = 'img-preview-popup-media' + (isVideo ? ' is-video' : '');
            var label = isVideo ? 'WEBM' : '';
            popupLabel.textContent = label;
            popupLabel.style.display = label ? 'block' : 'none';
            popup.style.display = 'block';
            positionPopupForThumb(thumb);
        } else {
            // same url: keep element, just ensure visible and re-anchor (in case of scroll)
            popup.style.display = 'block';
        }
    }

    function scheduleHide() {
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(function() {
            if (popup) {
                popup.style.display = 'none';
            }
            hideTimer = null;
        }, HIDE_DELAY_MS);
    }

    function cancelHide() {
        if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }
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

        var isVideo = isVideoUrl(artifactImageUrl);
        var animated = isVideo; // webm treated like gif for badge styling

        var thumbCell = d.createElement('td');
        thumbCell.className = 'img-preview-cell';

        var thumb;
        if (isVideo) {
            thumb = d.createElement('video');
            thumb.src = artifactImageUrl;
            thumb.muted = true;
            thumb.loop = true;
            thumb.autoplay = true;
            thumb.playsInline = true;
        } else {
            thumb = d.createElement('img');
            thumb.src = artifactImageUrl;
        }
        var extraClass = isVideo ? ' is-video' : (animated ? ' is-gif' : '');
        thumb.className = 'img-preview-thumb' + extraClass;
        thumb.alt = 'Preview';
        thumb.title = isVideo ? 'WebM preview' : (animated ? 'GIF preview' : 'Preview');
        thumb.loading = 'lazy';
        thumb.decoding = 'async';
        thumb.referrerPolicy = 'no-referrer';
        thumb.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.open(artifactImageUrl, '_blank');
        });
        thumb.addEventListener('mouseenter', function() {
            showPopup(thumb, artifactImageUrl, isVideo);
        });
        thumb.addEventListener('mouseleave', scheduleHide);
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
