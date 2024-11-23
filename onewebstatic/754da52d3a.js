(function($) {
    $.fn.isMobileWidth = function() {
        var innerWidth = window.innerWidth;
        var clientWidth = document.documentElement.clientWidth;
        var width = innerWidth && clientWidth ? Math.min(innerWidth, clientWidth) : innerWidth || clientWidth;
        return width <= 650
    };
    $.fn.isDesktopPreview = function() {
        var parentIframe = window.frameElement;
        if (parentIframe) {
            var src = parentIframe.getAttribute('src') || '';
            var url = new URL(src, window.location.origin);
            return url.searchParams.get('templateselectorpreview') === 'desktop'
        }
    };
    $.fn.isDesktopView = function() {
        var templateElt = $('.template'),
            isMobileView = $(templateElt).data('mobile-view'),
            isMobileWidth = $().isMobileWidth(),
            isDesktopPreview = $().isDesktopPreview();
        return isDesktopPreview || !isMobileView || !isMobileWidth
    };
    $.fn.isMobileDevice = function() {
        var isIpadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || isIpadOS
    };

    function getStickyElementHeightsUntil(node) {
        var stickyCmpSelector = 'div.mm-mobile-preview, body:not(.mobileV) div[data-specific-kind="STRIP"], body:not(.mobileV) div[data-specific-kind="SECTION"]',
            found;
        return $(stickyCmpSelector).filter(function() {
            var dataset = this.dataset;
            if (found || this === node) {
                found = true;
                return
            }
            return (dataset.mobilePin || dataset.pin) > 0
        }).toArray().reduce(function(sum, ele) {
            return sum + ele.offsetHeight
        }, 0)
    }
    $.fn.scrollIntoSection = function(sectionId, callback) {
        var element = document.getElementById(sectionId || ''),
            newTop = getStickyElementHeightsUntil(element);
        if (element) {
            $.fn.scrollIntoView(element, newTop, callback)
        }
    };
    var scrollIntoViewFn = function(element, newTop, callback, duration) {
        var bodyEle = window.document.body,
            $ele = $(element),
            isStickyClass = 'is-sticky',
            start = $(document).scrollTop(),
            currentTime = 0,
            increment = 20,
            cancelScroll = false,
            change, target, scrollingEle = document.documentElement,
            htmlHeight = scrollingEle.getBoundingClientRect().height,
            bodyHeight = bodyEle.getBoundingClientRect().height;
        if (bodyHeight > htmlHeight && scrollingEle.style.height !== '100%') {
            scrollingEle = bodyEle
        }
        start = scrollingEle.scrollTop;
        var previousPageHeight = scrollingEle.scrollHeight;

        function easeInOutQuad(t, b, c, d) {
            t /= d / 2;
            if (t < 1) {
                return c / 2 * t * t + b
            }
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b
        }
        var cancelAnimateScroll = function() {
                cancelScroll = true;
                document.removeEventListener('wheel', cancelAnimateScroll)
            },
            getPositionOfStrip = function() {
                var target, display = element.style.display;
                element.style.display = 'block';
                target = element.getBoundingClientRect().top;
                if (element.dataset.pin !== 0 && $ele.hasClass(isStickyClass)) {
                    $ele.removeClass(isStickyClass);
                    target = element.getBoundingClientRect().top;
                    $ele.addClass(isStickyClass)
                }
                element.style.display = display;
                return target
            };
        document.addEventListener('wheel', cancelAnimateScroll);
        target = getPositionOfStrip();
        change = target - (newTop || 0);
        duration = !isNaN(duration) ? duration : Math.abs(change) > 1000 ? Math.min(Math.abs(change / 2), 1500) : 500;
        if (change === 0) {
            return
        }

        function animateScroll() {
            if (cancelScroll) return;
            currentTime += increment;
            var remainingTime = duration - currentTime;
            if (previousPageHeight !== scrollingEle.scrollHeight && remainingTime > 0) {
                cancelAnimateScroll();
                scrollIntoViewFn(element, newTop, callback, remainingTime);
                previousPageHeight = scrollingEle.scrollHeight
            }
            var scrollPosition = easeInOutQuad(currentTime, start, change, duration);
            scrollingEle.scrollTo(0, scrollPosition);
            if (currentTime < duration) {
                window.requestAnimationFrame(animateScroll)
            } else {
                var finalScrollPosition = getPositionOfStrip() - newTop;
                scrollingEle.scrollBy(0, finalScrollPosition);
                document.removeEventListener('wheel', cancelAnimateScroll);
                if (typeof callback === 'function') {
                    callback(element, newTop)
                }
            }
        }
        animateScroll()
    };
    $.fn.scrollIntoView = scrollIntoViewFn;
    $.fn.removeHash = function() {
        var hash = location.hash,
            url = location.href.replace(hash, '');
        history.replaceState(null, null, url)
    };
    $.fn.pushHashState = function(value) {
        if (!value) {
            return
        }
        if (location.hash.substr(1) !== value) {
            try {
                history.pushState(null, null, '#' + value)
            } catch (e) {
                console.warn(e.message)
            }
        }
        $.fn.scrollIntoSection(value)
    };
    $.fn.adjustSharedBgImgViewHeight = function() {
        var sharedBgImgView = document.querySelector('div[data-bg-id="SHARED_BG_IMG"]'),
            header = document.querySelector('div[data-in-template=true][data-specific-kind=SECTION]');
        if (sharedBgImgView && header) {
            sharedBgImgView.firstChild.style.minHeight = '';
            var firstSection = document.querySelector('div[data-in-template=false][data-specific-kind=SECTION]');
            var headerAndFirstSectionHeight = header.getBoundingClientRect().height + firstSection.getBoundingClientRect().height;
            sharedBgImgView.firstChild.style.minHeight = headerAndFirstSectionHeight + 'px';
            var isDesktopView = $().isDesktopView();
            var sectionBg = firstSection.querySelector('div.sectionSharedBg');
            if (sectionBg) {
                if (isDesktopView) {
                    sectionBg.remove()
                } else {
                    sharedBgImgView.remove()
                }
            } else {
                if (firstSection && firstSection.firstChild) {
                    const children = firstSection.firstChild.children;
                    for (let i = 0; i < children.length; i++) {
                        if ((children[i].className || '').includes('scrollEffectContainer')) {
                            children[i].remove()
                        }
                    }
                }
            }
        }
    };

    function sectionLinkHandler(e) {
        var $target = $(e.target),
            $sectionLink = $target.closest('a[sectionid]'),
            sectionId = $sectionLink.length ? $sectionLink.attr('sectionid') : null;
        if (!sectionId) {
            return
        }
        var strip = document.body.querySelector('div[data-specific-kind=SECTION][data-id="' + sectionId + '"], div[data-specific-kind=STRIP][data-id="' + sectionId + '"]'),
            stripId = strip && strip.id;
        if (stripId && e.currentTarget.target !== '_blank') {
            e.preventDefault();
            $.fn.pushHashState(stripId)
        }
    }
    $('div.menu.dropdown, a[sectionid], [data-specific-kind="IMAGESLIDER"]').on('click', sectionLinkHandler)
}(oneJQuery));