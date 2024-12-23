document.addEventListener('DOMContentLoaded', function() {
    var nodes, node, i, dataSpecificKind;
    var getAncestorOrSelfWithDataSpecificKind = function(el) {
        while (el) {
            if (el.getAttribute && el.getAttribute('data-specific-kind')) {
                return el
            }
            el = el.parentNode
        }
        return el
    };
    nodes = document.querySelectorAll("div[data-link='we-link']");
    for (i = 0; i < nodes.length; i++) {
        node = nodes[i];
        var classNames = node.getAttribute('class');
        var href = node.firstChild.getAttribute('href');
        if (classNames && classNames.indexOf('shinybox') > -1) {
            node.setAttribute('href', href);
            continue
        }
        var target = node.getAttribute('target');
        (function(node, href, target) {
            node.addEventListener('click', function(event) {
                var initialTargetNode = getAncestorOrSelfWithDataSpecificKind(event.target);
                var currentTargetNode = getAncestorOrSelfWithDataSpecificKind(event.currentTarget);
                if (initialTargetNode == currentTargetNode) {
                    window.open(href, target || '_self')
                }
            })
        }(node, href, target))
    }
});