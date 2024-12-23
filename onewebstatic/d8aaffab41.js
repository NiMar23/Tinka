(function($) {
    $(window).on('view-chosen', function(evt, isDesktop) {
        var stickyClassname = 'is-sticky';
        var stickyWrapperClassname = 'sticky-wrapper';
        var stickySelector = '.' + stickyClassname;
        var notStickySelector = ':not(' + stickySelector + ')';
        var onStickEvent = 'on-stick';
        var onUnStickEvent = 'on-unstick';
        var maxHeight = Math.max($(window).height(), window.innerHeight, document.documentElement.clientHeight);
        var initStripPin = function() {
            var pinToTopSelector = isDesktop ? '[data-pin="1"]' : '[data-mobile-pin="1"]';
            var pinToBottomSelector = isDesktop ? '[data-pin="-1"]' : '[data-mobile-pin="-1"]';
            var sorter = function(a, b) {
                if (a > b) {
                    return 1
                } else if (a < b) {
                    return -1
                }
                return 0
            };
            var pinnedTopElements = $(pinToTopSelector).sort(function(el1, el2) {
                var el1Top = $(el1).offset().top;
                var el2Top = $(el2).offset().top;
                return sorter(el1Top, el2Top)
            });
            var pinnedBottomElements = $(pinToBottomSelector).sort(function(el1, el2) {
                var el1Bottom = $(el1).offset().top + $(el1).outerHeight();
                var el2Bottom = $(el2).offset().top + $(el2).outerHeight();
                return sorter(el1Bottom, el2Bottom)
            });
            if (pinnedTopElements.length || pinnedBottomElements.length) {
                $.fn.hasReachedElementTop = function(offset) {
                    var elementTop = $(this).offset().top;
                    var viewportTop = $(window).scrollTop() + (offset || 0);
                    return viewportTop >= elementTop
                };
                $.fn.hasReachedElementBottom = function(offset) {
                    var elementTop = $(this).offset().top;
                    var elementBottom = elementTop + $(this).outerHeight();
                    var viewportTop = $(window).scrollTop();
                    var viewPortBottom = viewportTop + maxHeight - (offset || 0);
                    return viewPortBottom <= elementBottom
                };
                var mapPinToTopOffset = {};
                var mapPinToBottomOffset = {};
                var createOffsetMap = function(pinnedElements) {
                    var map = {};
                    var previousSpacing = 0;
                    pinnedElements.each(function() {
                        var $this = $(this);
                        var dataId = $this.data('id');
                        map[dataId] = previousSpacing;
                        previousSpacing += $this.outerHeight()
                    });
                    return map
                };
                var getFloatingStripOffsetCorrectionMap = function(pinnedElements, cb) {
                    var map = {};
                    pinnedElements.each(function() {
                        var $this = $(this);
                        var dataId = $this.data('id');
                        var pin = $this.data('pin');
                        var isFloat = $this.parents('.float').first().length;
                        var baseComponentOfFloat = $this.parents('.row').first().find('>div:last-child [data-pin="' + pin + '"]');
                        if (isFloat && baseComponentOfFloat.length) {
                            var baseComponentId = $(baseComponentOfFloat).data('id');
                            var baseComponentOfFloatOffset = $(baseComponentOfFloat).offset();
                            var baseComponentOfFloatOffsetTop = baseComponentOfFloatOffset.top;
                            var baseComponentOfFloatOffsetBottom = baseComponentOfFloatOffset.top + $(baseComponentOfFloat).outerHeight();
                            var floatOffset = $this.offset();
                            var floatOffsetTop = floatOffset.top;
                            var floatOffsetBottom = floatOffsetTop + $this.outerHeight();
                            cb(baseComponentId, baseComponentOfFloatOffsetTop, baseComponentOfFloatOffsetBottom, dataId, floatOffsetTop, floatOffsetBottom, map)
                        }
                    });
                    return map
                };
                var mapPinToTopFloatingOffsetCorrection = getFloatingStripOffsetCorrectionMap(pinnedTopElements, function(baseComponentId, baseComponentTop, baseComponentBottom, floatComponentId, floatComponentTop, floatComponentBottom, map) {
                    var diffOffset = 0;
                    if (baseComponentTop >= floatComponentTop) {
                        diffOffset = floatComponentBottom - baseComponentTop;
                        map[baseComponentId] = diffOffset
                    } else {
                        diffOffset = baseComponentBottom - floatComponentTop;
                        map[floatComponentId] = diffOffset
                    }
                });
                var pinUpdaterFactory = function(filterFn, cb) {
                    return function(elements, mapOffset, mapOffsetCorrection) {
                        elements.each(function() {
                            var $this = $(this);
                            var dataId = $this.data('id');
                            var offset = mapOffset[dataId];
                            var offsetCorrection = mapOffsetCorrection[dataId] || 0;
                            if (filterFn.call(this, offset - offsetCorrection)) {
                                cb.call(this, offset)
                            }
                        })
                    }
                };
                var unpinner = function(cssObj) {
                    var $this = $(this);
                    $this.css(cssObj).removeClass(stickyClassname);
                    $this.parents('.float').first().removeClass(stickyWrapperClassname);
                    $this.parent().css({
                        height: 'inherit'
                    }).removeClass(stickyWrapperClassname);
                    $(window).trigger(onUnStickEvent, [this])
                };
                var pinner = function(cssObj) {
                    var $this = $(this);
                    $this.addClass(stickyClassname).css(cssObj);
                    $this.parents('.float').first().addClass(stickyWrapperClassname);
                    $this.parent().css({
                        height: $this.outerHeight()
                    }).addClass(stickyWrapperClassname);
                    $(window).trigger(onStickEvent, [this])
                };
                var unpinFromTopUpdater = pinUpdaterFactory(function(offset) {
                    var elementContainer = $(this).parent();
                    return !$(elementContainer).hasReachedElementTop(offset)
                }, function() {
                    unpinner.call(this, {
                        top: 'unset'
                    })
                });
                var unpinFromBottomUpdater = pinUpdaterFactory(function(offset) {
                    var elementContainer = $(this).parent();
                    return !$(elementContainer).hasReachedElementBottom(offset)
                }, function() {
                    unpinner.call(this, {
                        bottom: 'unset'
                    })
                });
                var pinToTopUpdater = pinUpdaterFactory(function(offset) {
                    var elementContainer = $(this).parent();
                    return $(elementContainer).hasReachedElementTop(offset)
                }, function(offset) {
                    pinner.call(this, {
                        top: offset
                    })
                });
                var pinToBottomUpdater = pinUpdaterFactory(function(offset) {
                    var elementContainer = $(this).parent();
                    return $(elementContainer).hasReachedElementBottom(offset)
                }, function(offset) {
                    pinner.call(this, {
                        bottom: offset
                    })
                });
                var reverseOrderPinToTopElements = $($(pinnedTopElements).get().reverse());
                mapPinToTopOffset = createOffsetMap(pinnedTopElements);
                var reverseOrderPinToBottomElements = $($(pinnedBottomElements).get().reverse());
                mapPinToBottomOffset = createOffsetMap(reverseOrderPinToBottomElements);
                var mapPinToBottomFloatingOffsetCorrection = getFloatingStripOffsetCorrectionMap(pinnedBottomElements, function(baseComponentId, baseComponentTop, baseComponentBottom, floatComponentId, floatComponentTop, floatComponentBottom, map) {
                    var diffOffset = 0;
                    if (baseComponentTop >= floatComponentTop && baseComponentBottom > floatComponentBottom) {
                        diffOffset = floatComponentBottom - baseComponentTop;
                        map[floatComponentId] = diffOffset
                    } else if (baseComponentTop < floatComponentTop && baseComponentBottom < floatComponentBottom) {
                        diffOffset = baseComponentBottom - floatComponentTop;
                        map[baseComponentId] = diffOffset
                    } else if (baseComponentTop <= floatComponentTop && baseComponentBottom >= floatComponentBottom) {
                        diffOffset = floatComponentBottom - baseComponentTop;
                        map[floatComponentId] = diffOffset
                    }
                });
                var updater = function() {
                    maxHeight = Math.max($(window).height(), window.innerHeight, document.documentElement.clientHeight);
                    unpinFromTopUpdater(reverseOrderPinToTopElements.filter(stickySelector), mapPinToTopOffset, mapPinToTopFloatingOffsetCorrection);
                    unpinFromBottomUpdater(pinnedBottomElements.filter(stickySelector), mapPinToBottomOffset, mapPinToBottomFloatingOffsetCorrection);
                    pinToTopUpdater(pinnedTopElements.filter(notStickySelector), mapPinToTopOffset, mapPinToTopFloatingOffsetCorrection);
                    pinToBottomUpdater(reverseOrderPinToBottomElements.filter(notStickySelector), mapPinToBottomOffset, mapPinToBottomFloatingOffsetCorrection)
                };
                var updateOnChangeHeight = function() {
                    maxHeight = Math.max($(window).height(), window.innerHeight, document.documentElement.clientHeight);
                    var checkChangeInHeight = function(map, elements) {
                        var newMapOffset = createOffsetMap(elements);
                        var isHeightChanged = Object.keys(newMapOffset).some(function(key) {
                            return newMapOffset[key] !== map[key]
                        });
                        if (isHeightChanged) {
                            return newMapOffset
                        }
                        return null
                    };
                    var newMapPinToTopOffset = checkChangeInHeight(mapPinToTopOffset, pinnedTopElements);
                    if (newMapPinToTopOffset) {
                        mapPinToTopOffset = newMapPinToTopOffset
                    }
                    var newMapPinToBottomOffset = checkChangeInHeight(mapPinToBottomOffset, reverseOrderPinToBottomElements);
                    if (newMapPinToBottomOffset) {
                        mapPinToBottomOffset = newMapPinToBottomOffset
                    }
                    unpinFromTopUpdater(reverseOrderPinToTopElements, mapPinToTopOffset, mapPinToTopFloatingOffsetCorrection);
                    unpinFromBottomUpdater(pinnedBottomElements, mapPinToBottomOffset, mapPinToBottomFloatingOffsetCorrection);
                    pinToTopUpdater(pinnedTopElements, mapPinToTopOffset, mapPinToTopFloatingOffsetCorrection);
                    pinToBottomUpdater(reverseOrderPinToBottomElements, mapPinToBottomOffset, mapPinToBottomFloatingOffsetCorrection)
                };
                updater();
                if (isDesktop) {
                    $(window).scroll(updater).resize(updateOnChangeHeight)
                }
            }
        };
        $(initStripPin)
    })
}(oneJQuery));