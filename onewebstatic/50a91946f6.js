(function($) {
    var isDesktopView = $().isDesktopView();

    function makeHoverBoxColVisible() {
        var hoverBoxHoverColumns = $('[data-specific-kind="HOVERBOX"] div[class*="Preview_hoverCol"]');
        hoverBoxHoverColumns.each(function() {
            var hoverColumn$ = $(this);
            hoverColumn$.find('[data-show-on-hover="true"]').css({
                opacity: 1,
                pointerEvents: 'auto',
                transition: 'none',
                transform: 'none'
            });
            var defaultColumn = hoverColumn$.parent().find('div').first();
            if (!hoverColumn$.is($(defaultColumn))) {
                defaultColumn.css('display', 'none')
            }
            hoverColumn$.css('left', 0)
        })
    }

    function handleHoverBoxLoadingOnTouchDevices() {
        if (isDesktopView && $().isMobileDevice()) {
            makeHoverBoxColVisible()
        }
    }
    handleHoverBoxLoadingOnTouchDevices()
}(oneJQuery));