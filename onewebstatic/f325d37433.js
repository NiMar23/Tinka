oneJQuery(function($) {
    var webShopPolicyCmpSel = '[data-specific-kind="WEBSHOP_POLICIES"]',
        webShopPaymentMethodCmpSel = '[data-specific-kind="WEBSHOP_PAYMENT_METHODS"]',
        stripCmpSel = '[data-kind="STRIP"]',
        webShopPolicyContainerSel = webShopPolicyCmpSel + ' .webShopPolicyLinksContainer',
        wsbPolicyContainerSel = webShopPolicyCmpSel + ' .wsbPolicyLinksContainer',
        webShopPolicyLinkSel = webShopPolicyCmpSel + ' a',
        webShopPaymentMethodImageContainerSel = webShopPaymentMethodCmpSel + ' .webShopPaymentMethodImageContainer',
        webShopPaymentMethodPayWithTextSel = webShopPaymentMethodCmpSel + ' .webShopPayWithText',
        webShopPaymentMethodImageSel = webShopPaymentMethodCmpSel + ' img';

    function getWsb() {
        return window.one && window.one.application && window.one.application.wsb
    }

    function getParentStrip() {
        var parentStrip = $(webShopPolicyCmpSel).parents(stripCmpSel);
        if (!parentStrip.length) {
            parentStrip = $(webShopPaymentMethodCmpSel).parents(stripCmpSel)
        }
        return parentStrip
    };

    function getPaymentMethodImages(paymentMethods) {
        var paymentMethodImages = [];
        if (paymentMethods && paymentMethods.length) {
            paymentMethods.forEach(function(paymentMethod) {
                if (paymentMethod.images && paymentMethod.images.length) {
                    paymentMethodImages = paymentMethodImages.concat(paymentMethod.images)
                }
            })
        }
        return paymentMethodImages
    };
    var isPoliciesPopulated = false,
        isPaymentsPopulated = false,
        policiesInterval, paymentsInterval;
    var isWsbPolicyExists = function() {
        return !!$(wsbPolicyContainerSel).html()
    };
    var hideParentStripWhenPpIsNotPopulated = function(parentStrip) {
        if (!isWsbPolicyExists() && parentStrip) {
            parentStrip.hide()
        }
    };
    var showOrHideShopFooterStrip = function() {
        var wsb = getWsb(),
            isShopPublished = wsb && wsb.isShopPublished,
            parentStrip = getParentStrip();
        if (!isShopPublished) {
            clearInterval(policiesInterval);
            clearInterval(paymentsInterval);
            hideParentStripWhenPpIsNotPopulated(parentStrip);
            return
        }
        if (isPoliciesPopulated || isPaymentsPopulated) {
            var isPoliciesExists = wsb && wsb.policies && wsb.policies.length,
                isPaymentMethodsExists = wsb && wsb.paymentMethods && wsb.paymentMethods.length;
            if (!isPoliciesExists && !isPaymentMethodsExists) {
                hideParentStripWhenPpIsNotPopulated(parentStrip);
                return
            }
            parentStrip && parentStrip.show()
        }
    };
    policiesInterval = setInterval(function() {
        var wsb = getWsb();
        if (wsb && Object.keys(wsb).length > 1) {
            showOrHideShopFooterStrip();
            if (wsb.policies) {
                clearInterval(policiesInterval);
                isPoliciesPopulated = true;
                showOrHideShopFooterStrip();
                var isPoliciesExists = wsb && wsb.policies && wsb.policies.length;
                if (isPoliciesExists) {
                    var filteredPolicies = wsb.policies.filter(function(policy) {
                        var wsid = policy.wsid;
                        if (isWsbPolicyExists() && wsid && wsid === 'privacy-policy' && window.WSB_PRIVACY_POLICY_PUBLISHED) {
                            return false
                        }
                        return true
                    });
                    if ($(webShopPolicyLinkSel).length) {
                        $(webShopPolicyContainerSel).children().remove()
                    }
                    var $link = $(webShopPolicyCmpSel + ' .hidden-webShopPolicyLink').clone().show(),
                        $separator = $(webShopPolicyCmpSel + ' .hidden-webShopPolicyLinkSeparator').clone().show();
                    if (isWsbPolicyExists() && filteredPolicies.length > 0) {
                        $(webShopPolicyContainerSel).append($separator.clone())
                    }
                    filteredPolicies.forEach(function(policy, index) {
                        var $newLink = $link.clone();
                        $newLink.find('span').text(policy.name);
                        $($newLink).on('click', policy.fn);
                        $(webShopPolicyContainerSel).append($newLink);
                        if (index < filteredPolicies.length - 1) {
                            $(webShopPolicyContainerSel).append($separator.clone())
                        }
                    })
                } else {
                    if (!isWsbPolicyExists() && $(webShopPolicyCmpSel).length) {
                        $(webShopPolicyCmpSel).parents('.row').first().css('justify-content', 'center');
                        $(webShopPolicyCmpSel).parents('.col').first().remove()
                    }
                }
            }
        }
    }, 250);
    paymentsInterval = setInterval(function() {
        var wsb = getWsb();
        if (wsb && Object.keys(wsb).length > 1 && wsb.paymentMethods) {
            clearInterval(paymentsInterval);
            isPaymentsPopulated = true;
            showOrHideShopFooterStrip();
            var isPaymentMethodsExists = wsb && wsb.paymentMethods && wsb.paymentMethods.length;
            if (isPaymentMethodsExists) {
                var paymentMethods = wsb.paymentMethods;
                if ($(webShopPaymentMethodPayWithTextSel).length) {
                    var payWithText = wsb.translatedLabels && wsb.translatedLabels.payWith || 'Pay with';
                    $(webShopPaymentMethodPayWithTextSel).text(payWithText + ':')
                }
                if ($(webShopPaymentMethodImageSel).length) {
                    $(webShopPaymentMethodImageSel).remove()
                }
                var paymentMethodImages = getPaymentMethodImages(paymentMethods);
                if (paymentMethodImages.length) {
                    paymentMethodImages.forEach(function(image, j) {
                        $(webShopPaymentMethodImageContainerSel).append('<img src="' + image + '" class="webShopPaymentMethodImage" />')
                    })
                }
            }
        }
    }, 250)
});