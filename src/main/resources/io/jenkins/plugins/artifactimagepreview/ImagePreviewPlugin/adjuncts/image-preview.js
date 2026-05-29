(function(d){
    var popup = null;
    var popupImg = null;
    var popupLabel = null;
    var IMAGE_EXTS = ['png','jpg','jpeg','gif','webp','svg','bmp'];
    var ANIMATED_EXTS = ['gif'];

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

    function resolveUrl(href) {
        if (href.startsWith('http')) return href;
        var base = window.location.origin;
        return base + (href.startsWith('/') ? '' : '/') + href;
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

    function isImageLink(href) {
        if (!href) return false;
        var ext = href.split('.').pop().toLowerCase();
        return IMAGE_EXTS.indexOf(ext) !== -1;
    }

    function isAnimatedExt(href) {
        if (!href) return false;
        var ext = href.split('.').pop().toLowerCase();
        return ANIMATED_EXTS.indexOf(ext) !== -1;
    }

    function processLink(link) {
        if (link.dataset.ip) return;
        var href = link.getAttribute('href');
        if (!isImageLink(href)) return;
        link.dataset.ip = '1';

        var url = resolveUrl(href);
        var animated = isAnimatedExt(href);

        var thumb = d.createElement('img');
        thumb.className = 'img-preview-thumb' + (animated ? ' is-gif' : '');
        thumb.src = url;
        thumb.alt = 'Preview';
        thumb.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.open(url, '_blank');
        });
        thumb.addEventListener('mouseenter', function(e) { showPopup(url, e.clientX, e.clientY, animated); });
        thumb.addEventListener('mousemove', function(e) { showPopup(url, e.clientX, e.clientY, animated); });
        thumb.addEventListener('mouseleave', hidePopup);
        link.parentNode.insertBefore(thumb, link.nextSibling);

        if (animated) {
            var badge = d.createElement('span');
            badge.className = 'img-preview-gif-badge';
            badge.textContent = 'GIF';
            badge.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.open(url, '_blank');
            });
            link.parentNode.insertBefore(badge, thumb.nextSibling);
        }
    }

    function init() {
        d.querySelectorAll('a[href*="artifact/"]').forEach(processLink);
    }

    function setup() {
        setTimeout(init, 500);
        new MutationObserver(init).observe(d.body, {childList: true, subtree: true});
    }

    if (d.readyState === 'loading') {
        d.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
})(document);
