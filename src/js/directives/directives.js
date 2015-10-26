(function (angular) {
    'use strict';
    var app = angular.module('FileManagerApp');

    app.directive('angularFilemanager', ['$compile', '$http', '$templateCache', 'fileManagerConfig', function ($compile, $http, $templateCache, fileManagerConfig) {
        var getLayoutTemplate = function (layout) {
            var url = fileManagerConfig.tplPath + '/layout-';
            if (typeof layout === 'undefined') {
                url += 'default.html';
            } else {
                url += layout + '.html';
            }
            console.log('Print layout: ' + url);
            return $http.get(url, {cache: $templateCache});
        };
        var linker = function (scope, element, attrs) {
            var loader = getLayoutTemplate(attrs.layout);
            loader.success(function (html) {
                element.html(html);
            }).then(function () {
                element.replaceWith($compile(element.html())(scope));
            });
        };

        return {
            restrict: 'EA',
            scope: {
                layout: '='
            },
            link: linker
        };
    }]);

    app.directive('ngFile', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.ngFile);
                var modelSetter = model.assign;

                element.bind('change', function () {
                    scope.$apply(function () {
                        modelSetter(scope, element[0].files);
                    });
                });
            }
        };
    }]);

    app.directive('ngRightClick', ['$parse', function ($parse) {
        return function (scope, element, attrs) {
            var fn = $parse(attrs.ngRightClick);
            element.bind('contextmenu', function (event) {
                scope.$apply(function () {
                    event.preventDefault();
                    fn(scope, {$event: event});
                });
            });
        };
    }]);

})(angular);
