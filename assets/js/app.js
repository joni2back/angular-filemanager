var FileManagerApp = angular.module('FileManagerApp', []);

FileManagerApp.directive('ngFile', ['$parse', function ($parse) {
    //ng-file property
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