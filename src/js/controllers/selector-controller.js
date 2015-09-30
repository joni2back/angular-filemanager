(function(angular, $) {
    'use strict';
    angular.module('FileManagerApp').controller('ModalFileManagerCtrl', 
        ['$scope', '$rootScope', 'fileNavigator', 
        function($scope, $rootScope, FileNavigator) {

        $scope.reverse = false;
        $scope.predicate = ['model.type', 'model.name'];
        $scope.order = function(predicate) {
            $scope.reverse = ($scope.predicate[1] === predicate) ? !$scope.reverse : false;
            $scope.predicate[1] = predicate;
        };

        $scope.fileNavigator = new FileNavigator();
        $rootScope.select = function(item, temp) {
            temp.tempModel.path = item.model.fullPath().split('/');
            $('#selector').modal('hide');
        };
        
        $rootScope.openNavigator = function(item) {
            $scope.fileNavigator.currentPath = item.model.path.slice();
            $scope.fileNavigator.refresh();
            $('#selector').modal('show');
        };

    }]);
})(angular, jQuery);