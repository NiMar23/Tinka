(function($) {
    var MENU_DROPDOWN_FADEIN_TIME = 350;
    var ENABLE_SCROLL_AFTER_PAGES = 10;

    function getFittingItemsCount(widthAvailableForItems, itemsWidths) {
        return itemsWidths.reduce(function(acc, width) {
            var widthAcc = acc[0],
                count = acc[1];
            if (widthAcc + width > widthAvailableForItems) {
                return [widthAcc + width, count]
            }
            return [widthAcc + width, count + 1]
        }, [0, 0])[1]
    }

    function isAndroidDesktopMode() {
        var webkitVer = parseInt(/WebKit\/([0-9]+)|$/.exec(navigator.appVersion)[1], 10);
        var isGoogle = webkitVer && navigator.vendor.indexOf('Google') === 0;
        var isAndroid = isGoogle && navigator.userAgent.indexOf('Android') > 0;
        var androidDesktopMode = !isAndroid && isGoogle && navigator.platform.indexOf('Linux a') === 0 && 'ontouchstart' in document.documentElement;
        return androidDesktopMode
    }

    function isTablet() {
        var userAgent = navigator.userAgent.toLowerCase();
        var isTabletDevice = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
        return isTabletDevice
    }

    function isIOSDevice() {
        var userAgent = navigator.userAgent.toLowerCase();
        return /ipad|iphone/.test(userAgent) && /webkit/.test(userAgent)
    }

    function isMobile() {
        var isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        return isMobileDevice
    }
    var androidDesktopMode = isAndroidDesktopMode();
    var isNotIosDevice = !isIOSDevice();
    var followTwoClicksEnabled = androidDesktopMode || isTablet() || isMobile();

    function liToWidth(index, li) {
        return li.getBoundingClientRect().width
    }

    function removeSeparatorFromLastItem(lis) {
        lis.last().find('div').remove()
    }

    function getMenuWidth(menu) {
        var $tempMenu = menu.clone();
        var width = $tempMenu.width();
        if ($tempMenu.hasClass('horizontalalignfit')) {
            $tempMenu.removeClass('horizontalalignfit');
            width = $tempMenu.width()
        }
        $tempMenu.remove();
        return width
    }

    function isModernLayoutMenu($el) {
        return $el.hasClass('modernLayoutMenu')
    }

    function doesItHaveMoreDepth($pages, depth, limit) {
        for (var i = $pages.length; i > 0; i--) {
            var $page = $($pages[i - 1]);
            var $subPages = $page.children('ul').children('li');
            var newDepth = $subPages.length + depth + i;
            if (newDepth > limit) {
                return true
            }
            if (doesItHaveMoreDepth($subPages, depth + i, limit)) {
                return true
            }
        }
        return false
    };
    var isMoreButtonExists = [];
    var moreButtons = [];
    var deletedMoreBtns = [];
    var modernLayoutMenuWithMoreSel = '.menu.moreEnabled.modernLayoutMenu:not(.jsdropdown)',
        menuWithMoreSel = '.moreEnabled:not(.jsdropdown)',
        isModernLayoutMenuExists = !!$(modernLayoutMenuWithMoreSel).length;
    if (isModernLayoutMenuExists) {
        $(modernLayoutMenuWithMoreSel).each(function(index, menu) {
            var $menu = $(menu),
                $menuWrapper = $menu.parents('[data-kind="MENU"]'),
                $parentCol = $($menuWrapper.parent());
            $menu.css('width', 'auto');
            $menuWrapper.css('width', 'auto');
            $parentCol.css('flex-grow', '1')
        })
    }
    $(menuWithMoreSel).each(function(index, menu) {
        var $menu = $(menu);
        $menu.css('display', '');
        isMoreButtonExists[index] = true
    });
    var isInitialState = true;

    function fixMoreButtons(fixSpecificIndex) {
        $(menuWithMoreSel).each(function(index, menu) {
            if (fixSpecificIndex != null && index !== fixSpecificIndex) {
                return
            }
            var isHorizontalalignfit = $(menu).hasClass('horizontalalignfit');
            if (isHorizontalalignfit) {
                $(menu).children('ul').children('li').css({
                    'display': 'inline-table'
                })
            }
            var $cartBtn = $('.wsb-li-cart'),
                isCartPresent = $cartBtn.length !== 0;
            morebuttonIndexOffset = isCartPresent ? 2 : 1;
            var $menu = $(menu),
                $ul = $menu.children('ul'),
                $lis = $ul.children('ul > li'),
                lisWidths = $lis.map(liToWidth).toArray(),
                totalItemsExcludingMore = lisWidths.length - morebuttonIndexOffset,
                $menuWrapper = $menu.parents('[data-kind="MENU"]'),
                $parentCol = $($menuWrapper.parent()),
                minMenuWidthInModernLayout = Math.ceil(lisWidths[0] + lisWidths[lisWidths.length - 1]),
                isMenuInModernLayout = isModernLayoutMenu($menu),
                menuWidth = isMenuInModernLayout ? Math.max($parentCol.width() - 10, minMenuWidthInModernLayout) : getMenuWidth($menu),
                cartBtnIndex = isCartPresent ? lisWidths.length - 1 : -1,
                cartBtnWidth = isCartPresent ? lisWidths[cartBtnIndex] : 0,
                moreBtnIndex = lisWidths.length - morebuttonIndexOffset,
                moreBtnWidth = lisWidths[moreBtnIndex],
                $moreBtn = $($lis[moreBtnIndex]),
                fittingItemsExcludingMore = getFittingItemsCount(menuWidth - cartBtnWidth, lisWidths.slice(0, -morebuttonIndexOffset)),
                $moreBtnUl, menuHiddenClassName;
            if (isMenuInModernLayout) {
                $(menu).css({
                    'min-width': minMenuWidthInModernLayout
                })
            }
            if (isHorizontalalignfit) {
                $(menu).children('ul').children('li').css({
                    'display': ''
                })
            }
            if (isInitialState) {
                moreButtons[index] = $moreBtn
            }
            if (!isMoreButtonExists[index]) {
                var firstLiTop;
                var lastLiTop;
                var spanHeight;
                try {
                    firstLiTop = $($lis[0]).find('span').offset().top;
                    lastLiTop = $($lis[$lis.length - 1]).find('span').offset().top;
                    spanHeight = $($lis[0]).find('span').height()
                } catch (err) {
                    firstLiTop = 0;
                    lastLiTop = 0;
                    spanHeight = 5
                }
                if (Math.abs(firstLiTop - lastLiTop) > spanHeight && lastLiTop > firstLiTop) {
                    $moreBtn = moreButtons[index];
                    $moreBtnUl = $moreBtn.children('ul');
                    menuHiddenClassName = $moreBtnUl.children().first().attr('class');
                    $moreBtnUl.children().remove();
                    var $lastMenuItem = $($lis[$lis.length - morebuttonIndexOffset]);
                    $lastMenuItem.children('.level-0').removeClass('level-0').addClass('level-1');
                    $lastMenuItem.attr('class', menuHiddenClassName);
                    $lastMenuItem.detach();
                    $moreBtnUl.append($lastMenuItem);
                    $cartBtn.remove();
                    $ul.append($moreBtn);
                    $ul.append($cartBtn);
                    isMoreButtonExists[index] = true;
                    fixDropdownMenus()
                }
                return
            }
            if (fittingItemsExcludingMore < totalItemsExcludingMore + (isInitialState ? 0 : 1)) {
                var fittingItemsWithMore = getFittingItemsCount(menuWidth - moreBtnWidth - cartBtnWidth, lisWidths.slice(0, -morebuttonIndexOffset));
                $moreBtnUl = $moreBtn.children('ul');
                var $itemsToMoveIntoMoreBtn = $lis.slice(fittingItemsWithMore, moreBtnIndex);
                menuHiddenClassName = $moreBtnUl.children().first().attr('class');
                if (!$itemsToMoveIntoMoreBtn.length) {
                    var $lisFromMoreButton = $moreBtnUl.children('li'),
                        $menuClone = $menu.clone();
                    $('body').append($menuClone);
                    $menuClone.css({
                        position: 'fixed',
                        left: '-1000',
                        top: '-1000'
                    });
                    var $ulClone = $menuClone.children('ul'),
                        $lisClone = $ulClone.children('ul > li'),
                        $moreBtnClone = $($lisClone[$lisClone.length - morebuttonIndexOffset]),
                        $cartBtnClone = $ulClone.find('.wsb-li-cart'),
                        $moreBtnUlClone = $moreBtnClone.children('ul'),
                        $lisFromMoreButtonClone = $moreBtnUlClone.children('li');
                    var ulCloneHeight = $ulClone.height();
                    $lisFromMoreButtonClone.children('.level-1').removeClass('level-1').addClass('level-0');
                    $moreBtnClone.remove();
                    $cartBtnClone.remove();
                    $ulClone.append($lisFromMoreButtonClone);
                    var ulCloneHeightAfterChange = $ulClone.height();
                    var newLisWidths = $ulClone.children('li').map(liToWidth).toArray(),
                        newFittingItemsExcludingMore = getFittingItemsCount(menuWidth - cartBtnWidth, newLisWidths);
                    if ((isModernLayoutMenu($menu) || ulCloneHeight === ulCloneHeightAfterChange) && newFittingItemsExcludingMore > fittingItemsExcludingMore) {
                        var numberOfItemsToMove = newFittingItemsExcludingMore - fittingItemsExcludingMore,
                            $itemsToMove;
                        if (numberOfItemsToMove === $lisFromMoreButton.length) {
                            deleteMoreButton();
                            $itemsToMove = $lisFromMoreButton.slice(0, numberOfItemsToMove)
                        } else {
                            var newFittingItemsWithMore = getFittingItemsCount(menuWidth - moreBtnWidth - cartBtnWidth, newLisWidths);
                            if (newFittingItemsWithMore > fittingItemsWithMore) {
                                numberOfItemsToMove = newFittingItemsWithMore - fittingItemsWithMore;
                                $itemsToMove = $lisFromMoreButton.slice(0, numberOfItemsToMove)
                            }
                        }
                        if ($itemsToMove && $itemsToMove.length) {
                            $itemsToMoveIntoMoreBtn.attr('class', menuHiddenClassName);
                            $itemsToMove.children('.level-1').removeClass('level-1').addClass('level-0');
                            $itemsToMove.detach();
                            $cartBtn.detach();
                            $moreBtn.detach();
                            $ul.append($itemsToMove);
                            if (numberOfItemsToMove !== $lisFromMoreButton.length) {
                                $ul.append($moreBtn)
                            }
                            isCartPresent && $ul.append($cartBtn);
                            fixDropdownMenus()
                        }
                    }
                    $menuClone.remove();
                    return
                }
                removeSeparatorFromLastItem($itemsToMoveIntoMoreBtn);
                $itemsToMoveIntoMoreBtn.attr('class', menuHiddenClassName);
                $itemsToMoveIntoMoreBtn.children('.level-0').removeClass('level-0').addClass('level-1');
                if (isInitialState) {
                    $moreBtnUl.children().remove()
                }
                $itemsToMoveIntoMoreBtn.detach();
                $moreBtnUl.prepend($itemsToMoveIntoMoreBtn)
            } else {
                if (isInitialState) {
                    deleteMoreButton();
                    !isCartPresent && $($lis[moreBtnIndex - 1]).children('.divider').remove()
                }
            }

            function deleteMoreButton() {
                isMoreButtonExists[index] = false;
                deletedMoreBtns[index] = $moreBtn;
                $moreBtn.remove()
            }
        });
        isInitialState = false
    }

    function getParentLi($el) {
        return $el.parents('li')[0]
    }

    function addExpandedClass($el) {
        $el.addClass('expanded')
    }

    function removeExpandedClass($el) {
        $el.removeClass('expanded')
    }

    function addHoverClass($el) {
        $el.addClass('hover')
    }

    function removeHoverClass($el) {
        $el.removeClass('hover')
    }

    function hasChildren($a) {
        return $a.parent().find('ul').length !== 0
    }
    var originalMenuOffset;

    function makeAttachExpandedClassesOnHoverForSelfAndParentA(subMenuLiClone) {
        return function(a) {
            var $a = $(a),
                aHasChildren = hasChildren($a),
                secondParentLi = getParentLi($(getParentLi($a))),
                currentParent = secondParentLi,
                $parentAnchors = [],
                counter = 0;
            while (currentParent !== subMenuLiClone) {
                if (counter > 100) {
                    throw new Error("Can't find subMenuLiClone as parent")
                }
                var $currentParent = $(currentParent),
                    $parentAnchor = $($currentParent.find('> a'));
                $parentAnchors.push($parentAnchor);
                currentParent = getParentLi($currentParent);
                counter++
            }
            if (aHasChildren && androidDesktopMode) {
                $a.on('click', function(event) {
                    var isSecondTimeClicked = $a.data('isSecondTimeClicked');
                    if (!isSecondTimeClicked) {
                        $a.data('isSecondTimeClicked', true);
                        event.stopPropagation();
                        return false
                    }
                })
            }

            function applyDirection(direction) {
                $a.parent('li').children('ul').css({
                    'left': direction == 'right' ? '100%' : 'none',
                    'right': direction == 'left' ? '100%' : 'none'
                })
            }

            function adjustDropdownDirection() {
                var currentDropdownOffset = $a.parent('li').offset();
                var parentDropdownOffset = $a.parent('li').parent('ul').parent('li').offset();
                var expandableUlWidth = $a.parent('li').width();
                var left;
                var menuDropdownSelector = 'div.menu.dropdown';
                var ulClasses = $a.parents(menuDropdownSelector).attr('class').split(' ');
                if (isVerticalDropdown(ulClasses) && currentDropdownOffset.left === parentDropdownOffset.left) {
                    parentDropdownOffset = originalMenuOffset
                }

                function leftDirection() {
                    left = currentDropdownOffset.left - expandableUlWidth;
                    if (left < 0) {
                        applyDirection('right')
                    } else {
                        applyDirection('left')
                    }
                }

                function rightDirection() {
                    left = currentDropdownOffset.left + 2 * expandableUlWidth;
                    if (left > $(window).width()) {
                        applyDirection('left')
                    } else {
                        applyDirection('right')
                    }
                }
                if (isHorizontalRight(ulClasses)) {
                    if (currentDropdownOffset.left <= parentDropdownOffset.left) {
                        leftDirection()
                    } else {
                        rightDirection()
                    }
                } else {
                    if (currentDropdownOffset.left >= parentDropdownOffset.left) {
                        rightDirection()
                    } else {
                        leftDirection()
                    }
                }
            }
            $a.mouseenter(function() {
                if (aHasChildren) {
                    addExpandedClass($a);
                    adjustDropdownDirection()
                }
                addHoverClass($a);
                $parentAnchors.forEach(function($el) {
                    $el.parent('li').css({
                        'z-index': 2
                    });
                    addExpandedClass($el);
                    addHoverClass($el)
                })
            });
            $a.mouseleave(function() {
                if (aHasChildren) {
                    removeExpandedClass($a);
                    if (androidDesktopMode) {
                        $a.data('isSecondTimeClicked', false)
                    }
                }
                removeHoverClass($a);
                $parentAnchors.forEach(function($el) {
                    $el.parent('li').css({
                        'z-index': 1
                    });
                    removeExpandedClass($el);
                    removeHoverClass($el)
                })
            })
        }
    }

    function isVerticalDropdown(classes) {
        return classes.some(function(element) {
            return element === 'menuvertical'
        }) && classes.some(function(element) {
            return element === 'dropdown'
        })
    }

    function isHorizontalRight(classes) {
        return classes.some(function(element) {
            return element === 'menuhorizontalright'
        })
    }

    function getMenuId($li) {
        var idAttrName = 'data-id',
            kindAttrName = '[data-specific-kind="MENU"]';
        return $li.parents(kindAttrName).attr(idAttrName)
    }
    var cleanLi;
    var cleanLiTimer;
    var cleanContainer;
    var cleanContainerTimer;
    var menuReferences = [];

    function fixDropdownMenus(_isModernLayoutMenu) {
        var hideClass = 'wsbmenuhide';
        var menuDropdownSelector = _isModernLayoutMenu ? 'div.menu.dropdown.modernLayoutMenu' : 'div.menu.dropdown';
        var timeout = 250;
        $(menuDropdownSelector + ' > ul > li').each(function(_, li) {
            var $li = $(li),
                expandableUl = $li.find('ul')[0];
            if (expandableUl) {
                if (menuReferences.indexOf(li) != -1) {
                    return
                }
                menuReferences.push(li);
                if (followTwoClicksEnabled && isNotIosDevice) {
                    $li.on('click', function(event) {
                        var isSecondTimeClicked = $li.data('isSecondTimeClicked');
                        if (!isSecondTimeClicked) {
                            $li.data('isSecondTimeClicked', true);
                            event.stopPropagation();
                            return false
                        }
                    })
                }
                var $a = $li.find('> a'),
                    aHasChildren = hasChildren($a),
                    contaierClassName = $li.parents(menuDropdownSelector).attr('class'),
                    UlClassName = $li.parent('ul').attr('class'),
                    idAttrName = 'data-id',
                    $expandableUl = $(expandableUl),
                    $parentUl = $($li.parent('ul')[0]),
                    $containerClone = $(document.createElement('div'));
                $containerClone.css({
                    position: 'absolute',
                    zIndex: 10000,
                    left: 0,
                    top: 0,
                    height: '0px',
                    display: 'block'
                });
                $containerClone.addClass(contaierClassName);
                $containerClone.attr(idAttrName, getMenuId($li));
                $containerClone.addClass('jsdropdown');
                var $subMenuUlClone = $(document.createElement('ul')),
                    $subMenuLiClone = $(document.createElement('li')),
                    attachExpandedClassesOnHoverForSelfAndParentA = makeAttachExpandedClassesOnHoverForSelfAndParentA($subMenuLiClone[0]);
                $subMenuUlClone.addClass(UlClassName);
                $subMenuUlClone.css({
                    border: 0,
                    'padding-left': 0,
                    'padding-right': 0
                });
                $subMenuLiClone.css('position', 'absolute');
                $containerClone.append($subMenuUlClone);
                $subMenuUlClone.append($subMenuLiClone);
                $(document.body).append($containerClone);
                var $expandableUlClone;
                $li.mouseenter(function(event) {
                    if (followTwoClicksEnabled) {
                        $li.data('isSecondTimeClicked', false)
                    }
                    if (cleanContainerTimer) {
                        clearTimeout(cleanContainerTimer);
                        cleanContainer()
                    }
                    if (cleanLiTimer) {
                        clearTimeout(cleanLiTimer);
                        cleanLi()
                    }
                    if (aHasChildren) {
                        addExpandedClass($a)
                    }
                    originalMenuOffset = $li.offset();
                    addHoverClass($li);
                    var expandableUlOffset = $expandableUl.offset();
                    var expandableUlWidth = $expandableUl.width();
                    var ulClasses = $containerClone.attr('class').split(' ');
                    removeHoverClass($li);
                    if (!(ulClasses.some(function(element) {
                            return element === 'menuvertical'
                        }) && ulClasses.some(function(element) {
                            return element === 'menuhorizontalright'
                        }))) {
                        expandableUlWidth = 0
                    }
                    var templateOffset = $('.template').offset();
                    $expandableUlClone = $expandableUl.clone().hide();
                    if (ulClasses.some(function(element) {
                            return element === 'modernLayoutMenu'
                        })) {
                        $expandableUlClone.appendTo($subMenuLiClone).fadeIn(MENU_DROPDOWN_FADEIN_TIME)
                    } else {
                        $expandableUlClone.appendTo($subMenuLiClone).show()
                    }
                    var allAnchors = $subMenuLiClone.find('a').toArray();
                    allAnchors.forEach(attachExpandedClassesOnHoverForSelfAndParentA);
                    addHoverClass($subMenuLiClone);
                    addHoverClass($a);
                    $expandableUl.addClass(hideClass);
                    var isVerticalDropdownMenu = isVerticalDropdown(ulClasses);
                    var left = expandableUlOffset.left - parseInt($parentUl.css('padding-left'), 10) + expandableUlWidth;
                    if (!isVerticalDropdownMenu && left + $expandableUlClone.width() > $(window).width()) {
                        left = $(window).width() - $expandableUlClone.width()
                    }
                    if (isVerticalDropdown(ulClasses)) {
                        if (left + $parentUl.width() + $expandableUlClone.width() > $(window).width()) {
                            left = left - $parentUl.width()
                        } else {
                            left = left + $parentUl.width()
                        }
                    }
                    var top = expandableUlOffset.top;
                    var sticky = $li.closest("[data-pin='1']");
                    if (sticky.length) {
                        var firstLevelPagesInDropdown = $expandableUl.children('li');
                        if (!doesItHaveMoreDepth(firstLevelPagesInDropdown, 0, ENABLE_SCROLL_AFTER_PAGES)) {
                            top = top - $(window).scrollTop();
                            $containerClone.css('position', 'fixed')
                        }
                    }
                    top = top - parseInt($parentUl.css('padding-top'), 10) - parseInt($('body')[0].style.top || 0, 10);
                    $containerClone.css({
                        left: left,
                        top: top
                    });
                    var allFirstLevelLis = $subMenuLiClone.find('> ul > li');
                    var allFirstLevelAncors = $subMenuLiClone.find('> ul > li > a');
                    var allLevel1Width = allFirstLevelLis.map(function(index, li) {
                        return oneJQuery(li).width()
                    });
                    var maxWidth = Math.max.apply(null, allLevel1Width);
                    allFirstLevelAncors.css('width', maxWidth);
                    var $level2PlusLis = $subMenuLiClone.find('> ul li');
                    $level2PlusLis.mouseenter(function(e) {
                        var $li = $(e.target).parent('li');
                        var allFirstLevelLis = $li.find('> ul > li');
                        var allFirstLevelAncors = $li.find('> ul > li > a');
                        var allLevel1Width = allFirstLevelLis.map(function(index, li) {
                            return oneJQuery(li).width()
                        });
                        var maxWidth = Math.max.apply(null, allLevel1Width);
                        allFirstLevelAncors.css('width', maxWidth)
                    })
                });
                $li.mouseleave(function(e) {
                    cleanLi = function() {
                        removeExpandedClass($a);
                        removeHoverClass($a);
                        $expandableUl.removeClass(hideClass);
                        var inSubMenu = $.contains($containerClone[0], e.relatedTarget);
                        if (!inSubMenu) {
                            removeHoverClass($subMenuLiClone);
                            $expandableUlClone.remove()
                        }
                        cleanLiTimer = null
                    };
                    cleanLiTimer = setTimeout(function() {
                        cleanLi()
                    }, timeout)
                });
                $containerClone.mouseenter(function() {
                    if (cleanLiTimer) clearTimeout(cleanLiTimer);
                    if (cleanContainerTimer) return clearTimeout(cleanContainerTimer);
                    addExpandedClass($a);
                    addHoverClass($a)
                });
                $containerClone.mouseleave(function() {
                    cleanContainer = function() {
                        removeExpandedClass($a);
                        removeHoverClass($subMenuLiClone);
                        removeHoverClass($a);
                        $expandableUlClone.remove();
                        cleanContainerTimer = null
                    };
                    cleanContainerTimer = setTimeout(function() {
                        cleanContainer()
                    }, timeout)
                })
            }
        })
    }
    if (isMoreButtonExists.length) {
        fixMoreButtons();
        var counter = 200,
            interval = setInterval(function() {
                fixMoreButtons();
                --counter;
                if (!counter) {
                    clearInterval(interval)
                }
            }, 100);
        if (isModernLayoutMenuExists) {
            $(window).resize(function() {
                var isFixDropDown = false;
                $(menuWithMoreSel).each(function(index, menu) {
                    var $menu = $(menu);
                    if (!isModernLayoutMenu($menu)) {
                        return
                    }
                    if (!isMoreButtonExists[index]) {
                        isMoreButtonExists[index] = true;
                        if (deletedMoreBtns[index]) {
                            $menu.children('ul').append(deletedMoreBtns[index]);
                            isInitialState = true;
                            var $lis = $menu.children('ul').children('li');
                            var lisArr = Array.from($lis);
                            $lis.each(function(index, li) {
                                $(li).off('mouseenter');
                                $(li).off('mouseleave')
                            });
                            var newMenuReferences = menuReferences.filter(function(ref) {
                                return !lisArr.includes(ref)
                            });
                            if (newMenuReferences.length !== menuReferences.length) {
                                menuReferences = newMenuReferences;
                                $('.jsdropdown.modernLayoutMenu[data-id="' + getMenuId($($lis[0])) + '"]').remove();
                                isFixDropDown = true
                            }
                        }
                    }
                    clearInterval(interval);
                    fixMoreButtons(index)
                });
                if (isFixDropDown) {
                    fixDropdownMenus(true)
                }
            })
        }
    }
    fixDropdownMenus()
}(oneJQuery));