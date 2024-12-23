(function($) {
    var isMobile = false,
        initializeShinyBox = function(el, noTitleCaptionBox) {
            if (el.length === 0) return;
            el.shinybox({
                verticalSwipeDisable: true,
                beforeOpen: function() {
                    if (isMobile) {
                        $('.shinybox-overlay').addClass('mobile-view')
                    } else {
                        $('.shinybox-overlay').removeClass('mobile-view')
                    }
                },
                noTitleCaptionBox: noTitleCaptionBox,
                sort: function(a, b) {
                    if ($(a).length) {
                        var isInstagramKind = $(a).parents('div[data-kind="INSTAGRAM_GALLERY"]').length > 0;
                        var ap = $(a).offset(),
                            bp = $(b).offset();
                        if (ap.top - bp.top !== 0 && !isInstagramKind) {
                            return ap.top - bp.top
                        } else if (ap.left - bp.left !== 0 && !isInstagramKind) {
                            return ap.left - bp.left
                        } else {
                            return $(a).data('dom-index') - $(b).data('dom-index')
                        }
                    } else {
                        return 1
                    }
                }
            })
        },
        tagCaptionEnabledLightbox = function() {
            var $this = $(this);
            initializeShinyBox($this.find('.shinybox'), $this.find("div[data-captionenabled='true']").length === 0)
        };
    $('.shinybox').each(function(index) {
        $(this).attr('data-dom-index', index)
    });
    $('div[data-kind="IMAGE"] > div > div > .shinybox').each(function() {
        var $this = $(this);
        initializeShinyBox($this, !$this.attr('title'))
    });
    $('div[data-kind="GALLERY"]').each(tagCaptionEnabledLightbox);
    $('div[data-kind="INSTAGRAM_GALLERY"]').each(tagCaptionEnabledLightbox);
    $(window).one('changed-to-mobile-view', function() {
        isMobile = true
    })
}(oneJQuery));