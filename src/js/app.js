(function(window, angular, $) {
    'use strict';
    angular.module('FileManagerApp', ['pascalprecht.translate']);

    /**
     * jQuery inits
     */
    $(window.document).on('shown.bs.modal', '.modal', function() {
        window.setTimeout(function() {
            $('[autofocus]', this).focus();
        }.bind(this), 100);
    });

    $(window.document).on('click', function() {
        $('#context-menu').hide();
    });

    $(window.document).on('contextmenu', '.main-navigation .table-files tr.item-list:has("td"), .item-list', function(e) {
        $('#context-menu').hide().css({
            left: e.pageX,
            top: e.pageY
        }).show();
        e.preventDefault();
    });

})(window, angular, jQuery);
