(function(d) {
    'use strict';
    var popup = null;
    var popupImg = null;
    var popupLabel = null;
    var IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|bmp|avif)(?:[?#].*)?$/i;
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

    function getArtifactImageUrl(link) {
        var href = link.getAttribute('href');
        if (!href) return null;

        var url;
        try {
            url = new URL(href, document.baseURI);
        } catch (e) {
            return null;
        }

        if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
        if (!url.pathname.includes('/artifact/')) return null;
        if (!IMAGE_EXTENSIONS.test(url.pathname)) return null;

        return url.href;
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

    function processLink(link) {
        if (link.dataset.ip) return;
        var artifactImageUrl = getArtifactImageUrl(link);
        if (!artifactImageUrl) return;
        link.dataset.ip = '1';

        var row = link.closest('tr');
        var cell = link.closest('td');
        var viewLink = row && row.querySelector('a[href$="/*view*/"]');
        var viewCell = viewLink && viewLink.closest('td');
        if (!cell || !row || !viewCell || row.dataset.ipPreview) return;
        row.dataset.ipPreview = '1';

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
    }

    function scanArtifactLinks(root) {
        var scope = root || d;
        scope.querySelectorAll('a[href]').forEach(processLink);
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
