(function(angular, $) {
    'use strict';
    angular.module('FileManagerApp').controller('ModalFileManagerCtrl', 
        ['$scope', '$rootScope', 'fileNavigator', 
        function($scope, $rootScope, FileNavigator) {

        $scope.reverse = false;
        $scope.predicate = ['model.type', 'model.name'];
        $scope.fileNavigator = new FileNavigator();

        $scope.order = function(predicate) {
            $scope.reverse = ($scope.predicate[1] === predicate) ? !$scope.reverse : false;
            $scope.predicate[1] = predicate;
        };

        $rootScope.select = function(item, temp) {
            temp.tempModel.path = item.model.fullPath().split('/');
            $rootScope.selectorModalPath = temp.tempModel.path;
            $('#selector').modal('hide');
        };

        $rootScope.openNavigator = function(path) {
            $scope.fileNavigator.currentPath = path;
            $scope.fileNavigator.refresh();
            $('#selector').modal('show');
        };

        $rootScope.getSelectedPath = function() {
            return ('/' + $rootScope.selectorModalPath.join('/')).replace(/\/\//, '/');
        };

        window.rootscope = $rootScope;
    }]);
})(angular, jQuery);