'use strict';
(function($) {
    function CustomObserver(cb) {
        var inbuilt = 'ResizeObserver' in window;
        var that = this;
        this.callback = inbuilt ? function(entry) {
            var newVal = entry[0].target[that.property];
            if (newVal !== that.currentVal) {
                cb(newVal, that.currentVal);
                that.currentVal = newVal
            }
        } : cb;
        this.observer = inbuilt ? new ResizeObserver(this.callback) : null;
        return this
    }
    CustomObserver.prototype.observe = function(target, property) {
        this.property = property || 'clientWidth';
        this.currentVal = target[this.property];
        if (!this.observer) {
            var that = this;
            clearInterval(this.cancelIntervalId);
            this.cancelIntervalId = setInterval(function() {
                var newVal = target[this.property];
                if (newVal !== that.currentVal) {
                    that.callback(newVal, that.currentVal);
                    that.currentVal = newVal
                }
            }, 100)
        } else {
            this.observer.observe(target)
        }
    };
    CustomObserver.prototype.disconnect = function() {
        if (this.observer) {
            this.observer.disconnect()
        } else {
            clearInterval(this.cancelIntervalId)
        }
    };
    var getAllColsFromRow = function getAllColsFromRow(row) {
        return Array.from(row.childNodes).filter(function(e) {
            return e.classList.contains('col')
        })
    };
    var filterRowNodesFromArray = function filterRowNodesFromArray(rows) {
        return Array.from(rows).filter(function(e) {
            return !!e && e.classList.contains('row')
        })
    };
    var setButtonsMaxWidth = function(col) {
        var buttons = Array.from(col.querySelectorAll(':scope > [data-kind="BUTTON"]'));
        buttons.forEach(function(btn) {
            btn.style.display = 'none';
            btn.style.maxWidth = ''
        });
        var maxBtnWidth = Math.floor(col.getBoundingClientRect().width - 30) / 2;
        var buttonsWidth = buttons.map(function(btn) {
            btn.style.display = '';
            var width = btn.getBoundingClientRect().width;
            btn.style.display = 'none';
            return width
        });
        buttons.forEach(function(btn) {
            btn.style.display = ''
        });
        if (buttons.length === 2) {
            var btn1Width = buttonsWidth[0],
                btn2Width = buttonsWidth[1];
            if (btn1Width > maxBtnWidth && btn2Width > maxBtnWidth) {
                buttons[0].style.maxWidth = maxBtnWidth + 'px';
                buttons[1].style.maxWidth = maxBtnWidth + 'px';
                return
            }
            if (btn1Width < maxBtnWidth) {
                buttons[0].style.minWidth = btn1Width + 'px';
                return
            }
            if (btn2Width < maxBtnWidth) {
                buttons[1].style.minWidth = btn2Width + 'px'
            }
        }
    };
    var updateLayoutWidths = function updateLayoutWidths(layout) {
        var rows = filterRowNodesFromArray(layout.childNodes);
        rows.forEach(function(row) {
            var cols = getAllColsFromRow(row);
            cols.forEach(function(col, i) {
                if (col.classList.contains('isButtonCol')) {
                    var prevCol = cols[i - 1];
                    if (!prevCol) {
                        setButtonsMaxWidth(col);
                        return
                    }
                    var prevColMaxWidth = prevCol.style.maxWidth;
                    if (i === 2) {
                        col.style.maxWidth = prevColMaxWidth ? 'calc(50% - 70px - (' + prevColMaxWidth + '/2))' : 'calc(33.33% - 70px)'
                    } else {
                        col.style.flexGrow = 0;
                        col.style.maxWidth = prevColMaxWidth ? 'calc(100% - 70px - ' + prevColMaxWidth + ')' : 'calc(50% - 70px)'
                    }
                    setButtonsMaxWidth(col)
                }
            });
            if (cols.length === 3) {
                var centerCol = cols[1],
                    firstCol = cols[0],
                    lastCol = cols[2],
                    otherCols = [firstCol, lastCol];
                var otherColIsExpandable = otherCols.some(function(col) {
                    return col.classList.contains('isExpandable')
                });
                if (!centerCol.classList.contains('isExpandable')) {
                    if (otherColIsExpandable) {
                        otherCols.forEach(function(col) {
                            col.style.flexGrow = 1;
                            col.style.maxWidth = ''
                        })
                    }
                    return
                }
                if (otherColIsExpandable) {
                    cols.forEach(function(col) {
                        col.style.flexGrow = 1;
                        col.style.maxWidth = ''
                    });
                    return
                }
                var colMaxWidth = Math.ceil(Math.max(firstCol.getBoundingClientRect().width, lastCol.getBoundingClientRect().width));
                otherCols.forEach(function(col) {
                    col.style.minWidth = ''.concat(colMaxWidth, 'px')
                })
            }
        })
    };
    var mergeVResponsiveRows = function(layout) {
        var vResponsiveRows = Array.from(layout.querySelectorAll(':scope > .row.vResponsive'));
        var flexDiv = document.createElement('div');
        flexDiv.classList.add('flexRowGroup');
        if (vResponsiveRows.length > 1) {
            layout.append(flexDiv);
            layout.insertBefore(flexDiv, vResponsiveRows[0]);
            vResponsiveRows.forEach(function(row) {
                row.classList.remove('vResponsive');
                flexDiv.appendChild(row)
            })
        }
    };
    var updateComponentStyles = function(layout) {
        var allWebShopPaymentMethods = Array.from(layout.querySelectorAll('[data-kind="WEBSHOP_PAYMENT_METHODS"]')).concat(Array.from(layout.querySelectorAll('[data-kind="WEBSHOP_POLICIES"]')));
        allWebShopPaymentMethods.forEach(function(cmpEle) {
            cmpEle.style.width = 'auto';
            cmpEle.style.height = 'auto'
        })
    };
    var layouts = Array.from(document.querySelectorAll('.modernLayout'));
    var allModernLayoutRows = Array.from(document.querySelectorAll("div.row[class*='flexRow']"));
    layouts.forEach(function(layout) {
        var widthObserver = new CustomObserver(function() {
            updateLayoutWidths(layout)
        });
        widthObserver.observe(layout);
        updateLayoutWidths(layout)
    });
    allModernLayoutRows.forEach(function(row) {
        var cols = getAllColsFromRow(row);
        if (cols.length === 1) {
            row.style.justifyContent = 'center'
        }
    });
    window.addEventListener('DOMContentLoaded', function(event) {
        layouts.forEach(function(layout) {
            mergeVResponsiveRows(layout);
            updateComponentStyles(layout)
        })
    });
    window.addEventListener('load', function() {
        layouts.forEach(function(layout) {
            updateLayoutWidths(layout)
        })
    })
}(oneJQuery));