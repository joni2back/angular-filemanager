(function(angular) {
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

        $scope.select = function(item) {
            $rootScope.selectorModalPath = item.model.fullPath().split('/');
            $scope.modal('selector', true);
        };

        $scope.selectedFilesAreChildOfPath = function(item) {
            var path = item.model.fullPath().replace(/^\//, '');
            return $scope.temps.find(function(item) {
                var itemPath = item.model.fullPath().replace(/^\//, '');
                if (path == itemPath) {
                    return true;
                }
                if (path.startsWith(itemPath)) {
                    //fixme names in same folder like folder-one and folder-one-two
                }
            });
        };

        $rootScope.openNavigator = function(path) {
            //fixme getSelectedPath still with last values closing and reopening modal
            $scope.fileNavigator.currentPath =  path;
            $rootScope.selectorModalPath = path;
            $scope.fileNavigator.refresh();
            $scope.modal('selector');
        };

        $rootScope.getSelectedPath = function() {
            return ('/' + $rootScope.selectorModalPath.join('/')).replace(/\/\//, '/');
        };

    }]);
})(angular);