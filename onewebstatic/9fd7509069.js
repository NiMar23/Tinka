(function($) {
    $(function() {
        var isDesktopView = $().isDesktopView();
        if (isDesktopView) {
            $(document.body).addClass('desktopV')
        }
        $(window).trigger('view-chosen', [isDesktopView])
    })
}(oneJQuery));