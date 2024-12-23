(function() {
    var mobileMaxWidth = 650,
        desktopViewPadding = 30,
        metaTag = document.querySelector('meta[name="viewport"]'),
        minPageWidthAttr = metaTag.getAttribute('minpagewidth'),
        minPageWidth = Math.max(parseInt(minPageWidthAttr, 10), mobileMaxWidth + 1) + desktopViewPadding;

    function isMobile() {
        try {
            var platform = navigator.platform,
                isApple = !!platform.toLowerCase().match(/(?:iphone|ipad)/),
                mediaQuery;
            if (isApple) {
                var isPortrait = window.orientation === 0;
                mediaQuery = (isPortrait ? '(max-device-width: ' : '(max-device-height: ') + mobileMaxWidth + 'px)'
            } else {
                mediaQuery = '(max-device-width: ' + mobileMaxWidth + 'px)'
            }
            return window.matchMedia(mediaQuery).matches
        } catch (e) {
            return window.screen.width <= mobileMaxWidth
        }
    }

    function determineZoomAbility() {
        if (isMobile()) {
            metaTag.setAttribute('content', 'width=device-width, initial-scale=1.0, minimum-scale=1.0')
        } else {
            metaTag.setAttribute('content', 'width=' + minPageWidth)
        }
    }
    determineZoomAbility()
}());