(function($) {
    function subscribePageHeightChange(cb) {
        var scrollHeight = document.documentElement.scrollHeight,
            canceled = false;
        (function checkForChange() {
            if (canceled) {
                return
            }
            var currentScrollHeight = document.documentElement.scrollHeight;
            if (scrollHeight !== currentScrollHeight) {
                cb(scrollHeight);
                scrollHeight = currentScrollHeight
            }
            window.requestAnimationFrame(checkForChange)
        }());
        return function() {
            canceled = true
        }
    }(function onReady() {
        var isCanceled = false,
            previewHash = window.localStorage.getItem('previewHash'),
            sectionId = decodeURI(window.location.hash.substr(1) || previewHash || ''),
            strip = document.body.querySelector('div[data-specific-kind=SECTION][data-id="' + sectionId + '"], div[data-specific-kind=STRIP][data-id="' + sectionId + '"]'),
            stripId;
        window.localStorage.removeItem('previewHash');
        strip = strip || document.getElementById(sectionId);
        stripId = strip && strip.id;

        function cancelDefaultScroll() {
            isCanceled = true
        }
        document.addEventListener('wheel', cancelDefaultScroll);
        $(window).on('load', cancelDefaultScroll);

        function cb(element, top) {
            if (isCanceled) {
                return
            }
            var cancelSub = subscribePageHeightChange(function() {
                if (isCanceled) {
                    cancelSub();
                    return
                }
                $.fn.scrollIntoView(element, top, null, 0)
            })
        }
        if (stripId) {
            $.fn.removeHash();
            window.scrollTo(0, 0);
            history.replaceState(null, null, '#' + stripId);
            $.fn.scrollIntoSection(stripId, cb)
        }
    }());
    window.addEventListener('popstate', function() {
        var hash = location.hash.substr(1);
        $.fn.scrollIntoSection(hash)
    })
}(oneJQuery));