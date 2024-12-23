(function($) {
    function run() {
        var g = function(id) {
                return document.getElementById(id)
            },
            container = g('MobileHeader_container'),
            burgerMenuIcon = g('MobileHeader_burgerMenuIcon'),
            inActivebgColor = burgerMenuIcon.getAttribute('data-inactive-bgcolor'),
            activebgColor = burgerMenuIcon.getAttribute('data-active-bgcolor'),
            menu = g('mm'),
            overlay = g('mm-overlay'),
            body = document.getElementsByTagName('body')[0],
            on = false;
        if (!container || !body) {
            return
        }

        function setOnOffClass(ele, newCls) {
            ele.className = ele.className.replace(/\bon|off\b/, '').trim() + ' ' + newCls
        }

        function setMenuIconStyles(color) {
            Array.prototype.slice.call(burgerMenuIcon.childNodes).forEach(function(node) {
                node.style.backgroundColor = color
            })
        }

        function toggleClasses() {
            var className = on ? 'on' : 'off';
            setOnOffClass(burgerMenuIcon, className);
            setOnOffClass(menu, className);
            setOnOffClass(overlay, className);
            setMenuIconStyles(on ? activebgColor : inActivebgColor)
        }

        function handleStickyMenu(on) {
            menu.scrollTop = 1;
            if (on) {
                $('html').css({
                    overflowY: 'hidden',
                    marginRight: Math.abs(window.innerWidth - document.documentElement.clientWidth) + 'px'
                })
            } else {
                $('html').css({
                    overflowY: '',
                    marginRight: ''
                })
            }
        }

        function onScroll() {
            if (menu.scrollTop < 1) {
                menu.scrollTop = 1
            } else if (menu.scrollHeight - menu.scrollTop - menu.clientHeight < 1) {
                menu.scrollTop = menu.scrollTop - 1
            }
        }
        var preventEvent = function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation()
        };
        var disableMenuTouchMove = function() {
            var windowInnerHeight = $(window).height();
            var padding = 149;
            var menuHeight = $(menu).find('ul:first').outerHeight() + padding;
            var menuHasNoScroll = menuHeight < windowInnerHeight;
            if (menuHasNoScroll) {
                $(menu).on('touchmove', preventEvent)
            } else {
                menu.scrollTop = 1;
                $(menu).off('touchmove')
            }
        };
        disableMenuTouchMove();
        $(menu).on('scroll', onScroll);
        $(window).resize(disableMenuTouchMove);
        $(overlay).on('touchmove', preventEvent);

        function toggleMenu() {
            on = !on;
            toggleClasses();
            handleStickyMenu(on)
        }
        overlay.onclick = toggleMenu;
        burgerMenuIcon.onclick = toggleMenu;
        menu.onclick = function(e) {
            var target, parent, targetTag;
            target = e ? e.target : window.event.srcElement;
            target = target.nodeType === 3 ? target.parentNode : target;
            targetTag = target.tagName;
            if ((targetTag === 'DIV' || targetTag === 'SPAN') && target.id !== 'mm') {
                parent = targetTag === 'SPAN' ? target.parentNode.parentNode.parentNode : target.parentNode.parentNode;
                parent.className = parent.className ? '' : 'expanded';
                disableMenuTouchMove();
                return
            }
            on = false;
            handleStickyMenu(on);
            toggleClasses()
        }
    }
    var readyTimer = setInterval(function() {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            run();
            clearInterval(readyTimer)
        }
    }, 10)
}(oneJQuery));