'use strict';
(function($) {
    function initializeStripNames() {
        var stripSelector = '[data-specific-kind="STRIP"]',
            pageStripCount = 0,
            templateStripCount = 0;
        $(stripSelector).toArray().map(function(ele) {
            var bound = ele.getBoundingClientRect(),
                inTemplate = ele.dataset.inTemplate === 'true',
                zIndex = parseInt($(ele).closest('[style*="z-index"]').css('zIndex')) || 0;
            return {
                top: bound.top,
                zIndex: zIndex,
                ele: ele,
                inTemplate: inTemplate
            }
        }).sort(function(a, b) {
            var value = a.top - b.top;
            if (!value) {
                return a.zIndex - b.zIndex
            }
            return value
        }).forEach(function(obj) {
            if (!obj.ele.id) {
                obj.ele.id = obj.inTemplate ? 'TemplateStrip' + ++templateStripCount : 'Strip' + ++pageStripCount
            }
        })
    }

    function setEmailAndPhoneClickTracking() {
        Array.from(document.querySelectorAll("[href^='mailto:']")).forEach(function(m) {
            m.addEventListener('click', function() {
                const sw = window.sw;
                if (sw && sw.register_mailto) {
                    sw.register_mailto()
                }
            })
        });
        Array.from(document.querySelectorAll("[href^='tel:']")).forEach(function(p) {
            p.addEventListener('click', function() {
                const sw = window.sw;
                if (sw && sw.register_phonecall) {
                    sw.register_phonecall()
                }
            })
        })
    }

    function showDesktopView() {
        if (!$().isDesktopPreview()) {
            return
        }
        const bodyEle = document.body;
        const templateWidth = document.querySelector('meta[name=viewport]') ? .getAttribute('minpagewidth') || 1050;
        const viewWidth = window.innerWidth || document.documentElement.clientWidth;
        const minContentWidth = parseInt(templateWidth, 10) + 100;
        if (viewWidth < minContentWidth) {
            bodyEle.style.zoom = `${viewWidth/minContentWidth}`
        }
    }

    function mobileMenuLinksSanitize() {
        var currentDomain = window.location.hostname;
        var currentProtocol = window.location.protocol;
        Array.from(document.querySelectorAll('#wsb-mobile-header a')).forEach(aEle => {
            var urlDomain = aEle.hostname;
            var urlProtocol = aEle.protocol;
            if (currentDomain === urlDomain && currentProtocol !== urlProtocol) {
                aEle.protocol = currentProtocol
            }
        })
    }
    mobileMenuLinksSanitize();
    showDesktopView();
    initializeStripNames();
    setEmailAndPhoneClickTracking();
    $().adjustSharedBgImgViewHeight()
}(oneJQuery));