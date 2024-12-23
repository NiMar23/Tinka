(function($) {
    var script = document.getElementById('mobileBackgroundLiner'),
        params = script && JSON.parse(script.getAttribute('data-params'));
    if (!params) {
        throw new Error('Failed to define define params for mobileBackgroundLiner')
    }
    var isBodyBgParax = params.scrollEffect === 'parallax';
    var isBodyBgFixed = params.scrollEffect === 'reveal';
    if (isBodyBgFixed) {
        var $body = $(document.body);
        $body.removeClass(params.bodyBackgroundClassName);
        $(document.createElement('div')).addClass([params.bodyBackgroundClassName, params.linerClassName].join(' ')).appendTo($body)
    } else if (isBodyBgParax) {
        var $body = $(document.body);
        $body.removeClass(params.bodyBackgroundClassName);
        var bodyBg = $(document.createElement('div'));
        var bodyBgWrapper = $(document.createElement('div'));
        bodyBg.addClass(params.bodyBackgroundClassName).attr('data-scroll-effect', params.scrollEffect);
        bodyBgWrapper.addClass('bgBodyWrapper');
        $(bodyBg).appendTo(bodyBgWrapper);
        $(bodyBgWrapper).appendTo(document.body)
    }
}(oneJQuery));