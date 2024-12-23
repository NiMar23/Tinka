'use strict';

function HeightObserver(cb) {
    var inbuilt = 'ResizeObserver' in window;
    var that = this;
    this.callback = inbuilt ? function(entry) {
        var newHeight = entry[0].target.clientHeight;
        if (newHeight !== that.currentHeight) {
            cb(newHeight, that.currentHeight);
            that.currentHeight = newHeight
        }
    } : cb;
    this.observer = inbuilt ? new ResizeObserver(this.callback) : null;
    return this
}
HeightObserver.prototype.observe = function(target) {
    this.currentHeight = target.clientHeight;
    if (!this.observer) {
        var that = this;
        this.cancelIntervalId = setInterval(function() {
            var newHeight = target.clientHeight;
            if (newHeight !== that.currentHeight) {
                that.callback(newHeight, that.currentHeight);
                that.currentHeight = newHeight
            }
        }, 100)
    } else {
        this.observer.observe(target)
    }
};
HeightObserver.prototype.disconnect = function() {
    if (this.observer) {
        this.observer.disconnect()
    } else {
        clearInterval(this.cancelIntervalId)
    }
};
var containerKindsMap = {
    STRIP: true,
    SECTION: true,
    BACKGROUND: true,
    HOVERBOX: true,
    IMAGE: true
};
(function($) {
    'use strict';
    var attachments = JSON.parse(document.body.dataset.attachments),
        observerMap = {},
        childToParentMap = {},
        componentsMap = {},
        getComponentNodeById = function getComponentNodeById(id) {
            if (!componentsMap[id]) {
                var node = document.querySelector('[data-id="' + id + '"][data-specific-kind]');
                componentsMap[id] = node
            }
            return componentsMap[id]
        },
        getComponentInfoFromNode = function getComponentInfoFromNode(node) {
            if (!node) {
                return null
            }
            var rect = node.getBoundingClientRect(),
                id, top, bottom, height;
            id = node.dataset.id;
            height = node.clientHeight || $(node).height();
            top = Math.round(rect.top + window.scrollY);
            bottom = Math.round(top + height);
            return {
                id: id,
                top: top,
                bottom: bottom,
                height: height
            }
        },
        getOverlappingChildren = function getOverlappingChildren(children) {
            if (!children || !children.length) {
                return []
            }
            return children.filter(function(id) {
                var node = componentsMap[id];
                return node && !!parseInt(node.dataset.bottomOverlap)
            })
        },
        getFinalBottom = function getFinalBottom(children, overlappingChildren, currentBottom) {
            return children.reduce(function(bottom, id) {
                var node = getComponentNodeById(id),
                    cmpInfo = getComponentInfoFromNode(node);
                if (!cmpInfo) {
                    return bottom
                }
                var childBottom = cmpInfo.bottom;
                if (overlappingChildren.indexOf(id) !== -1 && childBottom > bottom) {
                    var bottomOverlap = node.dataset.bottomOverlap,
                        diff = childBottom - bottomOverlap - bottom;
                    return diff > 0 ? bottom + diff : bottom
                }
                return Math.max(bottom, childBottom)
            }, currentBottom)
        },
        computeChildToParent = function computeChildToParent(acc, id) {
            if (acc[id]) {
                return acc
            }
            acc[id] = true;
            var node = getComponentNodeById(id);
            if (!node) {
                return
            }
            var initialMinHeight = node.firstChild.style.minHeight;
            node.firstChild.style.minHeight = null;
            var children = attachments[id],
                cmpInfo = getComponentInfoFromNode(node),
                finalHeight = getComponentInfoFromNode(node).height;
            if (children && children.length) {
                children.forEach(function(childId) {
                    childToParentMap[id] = childId;
                    computeChildToParent(acc, childId)
                });
                var overlappingChildren = getOverlappingChildren(children),
                    currentBottom = cmpInfo.bottom,
                    finalBottom = getFinalBottom(children, overlappingChildren, currentBottom),
                    diff = finalBottom - currentBottom;
                if (diff > 0) {
                    finalHeight = finalHeight + diff
                }
                node.firstChild.style.minHeight = finalHeight + 'px'
            } else if (!observerMap[id]) {
                var heightObserver = new HeightObserver(function(newHeight, oldHeight) {
                    if (newHeight !== oldHeight) {
                        var childId = id,
                            parentId = childToParentMap[childId];
                        while (parentId) {
                            childId = parentId;
                            parentId = childToParentMap[childId]
                        }
                        updateHeights(attachments)
                    }
                });
                heightObserver.observe(node);
                observerMap[id] = heightObserver
            }
            if (containerKindsMap[node.dataset.specificKind]) {
                node.firstChild.style.minHeight = finalHeight + 'px'
            }
            if (node.firstChild.style.minHeight === '0px') {
                node.firstChild.style.minHeight = initialMinHeight
            }
            return acc
        };

    function updateHeights(attachments) {
        Object.keys(attachments).reduce(computeChildToParent, {})
    }
    updateHeights(attachments);
    window.addEventListener('load', function() {
        Object.values(observerMap).forEach(function(observer) {
            observer.disconnect()
        })
    })
}(oneJQuery));