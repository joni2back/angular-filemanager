/*!
 * Angular FileManager v1.1.0 (https://github.com/joni2back/angular-filemanager)
 * Jonas Sciangula Street <joni2back@gmail.com>
 * Licensed under MIT (https://github.com/joni2back/angular-filemanager/blob/master/LICENSE)
 */

(function(window, angular, $) {
    "use strict";
    var app = angular.module('FileManagerApp', ['pascalprecht.translate', 'ngCookies']);

    app.directive('angularFileManager', ['$parse', 'fileManagerConfig', function($parse, fileManagerConfig) {
        return {
            restrict: 'EA',
            templateUrl: fileManagerConfig.tplPath + '/index.html'
        };
    }]);

    app.directive('ngFile', ['$parse', function($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.ngFile);
                var modelSetter = model.assign;

                element.bind('change', function() {
                    scope.$apply(function() {
                        modelSetter(scope, element[0].files);
                    });
                });
            }
        };
    }]);

    app.directive('ngRightClick', ['$parse', function($parse) {
        return function(scope, element, attrs) {
            var fn = $parse(attrs.ngRightClick);
            element.bind('contextmenu', function(event) {
                scope.$apply(function() {
                    event.preventDefault();
                    fn(scope, {$event: event});
                });
            });
        };
    }]);

    app.filter('strLimit', ['$filter', function($filter) {
        /*going to use css3 ellipsis instead of this*/
        return function(input, limit) {
            if (input.length <= limit) {
                return input;
            }
            return $filter('limitTo')(input, limit) + '...';
        };
    }]);

    app.filter('formatDate', ['$filter', function($filter) {
        return function(input, limit) {
            return input instanceof Date ?
                input.toISOString().substring(0, 19).replace('T', ' '):
                input.toString();
        };
    }]);

    /**
     * jQuery inits
     */
    var menuSelectors = '.main-navigation .table-files td:first-child, .iconset a.thumbnail';

    $(window.document).on('shown.bs.modal', '.modal', function() {
        var self = this;
        var timer = setTimeout(function() {
            $('[autofocus]', self).focus();
            timer && clearTimeout(timer);
        }, 100);
    });

    $(window.document).on('click', function() {
        $("#context-menu").hide();
    });

    $(window.document).on('contextmenu', menuSelectors, function(e) {
        $("#context-menu").hide().css({
            left: e.pageX,
            top: e.pageY
        }).show();
        e.preventDefault();
    });

})(window, angular, jQuery);
