(function($) {
    $.fn.isInViewport = function() {
        var elementTop = $(this).offset().top;
        var elementBottom = elementTop + $(this).outerHeight();
        var viewportTop = $(window).scrollTop();
        var viewportBottom = viewportTop + $(window).height();
        return elementBottom > viewportTop && elementTop < viewportBottom
    };
    var $window = $(window);
    var prevScroll = -1;
    var currentScrollTop = $window.scrollTop();
    var viewportHeight = $window.height();
    var init = function() {
        var parallaxElements = $('[data-scroll-effect="parallax"]');
        if (parallaxElements && parallaxElements.length) {
            updateParallax(parallaxElements)
        }
        var revealElements = $('[data-scroll-effect="reveal"]');
        var isIE11 = navigator.userAgent.match(/Trident\/7\./);
        if (revealElements.length && isIE11) {
            var $body = $('body');
            $body.on('mousewheel', function() {
                event.preventDefault();
                var wheelDelta = event.wheelDelta;
                var currentScrollPosition = window.pageYOffset;
                window.scrollTo(0, currentScrollPosition - wheelDelta)
            }).keydown(function(e) {
                var currentScrollPosition = window.pageYOffset;
                var KEY_UP = 38;
                var KEY_DOWN = 40;
                switch (e.which) {
                    case KEY_UP:
                        e.preventDefault();
                        window.scrollTo(0, currentScrollPosition - 120);
                        break;
                    case KEY_DOWN:
                        e.preventDefault();
                        window.scrollTo(0, currentScrollPosition + 120);
                        break;
                    default:
                        return
                }
            })
        }
    };
    var computeTranslations = function($img, viewportTop, viewportHeight) {
        var imgContainer = $img.parents('[data-id]:first');
        var $imgContainer = imgContainer.length ? $(imgContainer) : $($img.parent());
        if (!$imgContainer.isInViewport()) return;
        var containerHeight = $imgContainer.height();
        var imgHeight = $img.height();
        var range = imgHeight - containerHeight;
        var imgTop = $img.offset().top;
        var viewportBottom = viewportTop + viewportHeight;
        var percentage = (viewportBottom - imgTop) / ((viewportHeight + imgHeight) / 100);
        var translationY = range / 2 - percentage / 100 * range;
        if ($imgContainer.hasClass('bgBodyWrapper')) {
            percentage = viewportTop / (containerHeight - viewportHeight);
            translationY = -(percentage * range)
        }
        $img.css('transform', 'translate3d(0px, ' + translationY + 'px, 0px)')
    };
    var updateParallax = function(parallaxElements) {
        try {
            currentScrollTop = $window.scrollTop();
            if (prevScroll !== currentScrollTop) {
                viewportHeight = Math.max($(window).height(), window.innerHeight, document.documentElement.clientHeight);
                parallaxElements.each(function(i, element) {
                    computeTranslations($(element), currentScrollTop, viewportHeight)
                });
                prevScroll = currentScrollTop
            }
            window.requestAnimationFrame(updateParallax.bind(null, parallaxElements))
        } catch (e) {
            window.requestAnimationFrame(updateParallax.bind(null, $('[data-scroll-effect="parallax"]')))
        }
    };
    var timeoutId = null;
    var isInitialize = false;
    var callInit = function() {
        clearInterval(timeoutId);
        if (!isInitialize) {
            $(init);
            isInitialize = true
        }
    };
    $(window).on('view-chosen', function(evt, isDesktopView) {
        if (isDesktopView && !$().isMobileDevice()) {
            $(document.body).addClass('effects');
            var ctr = 0;
            var MAX_COUNTER = 1200;
            timeoutId = setInterval(function() {
                if (ctr < MAX_COUNTER) {
                    try {
                        viewportHeight = Math.max($(window).height(), window.innerHeight, document.documentElement.clientHeight);
                        $('[data-scroll-effect="parallax"]').each(function(i, element) {
                            computeTranslations($(element), currentScrollTop, viewportHeight)
                        })
                    } finally {
                        ctr++
                    }
                } else {
                    callInit()
                }
            }, 50);
            $(window).load(callInit)
        } else {
            $(document.body).addClass('no-effects')
        }
    })
}(oneJQuery));