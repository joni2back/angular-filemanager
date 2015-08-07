(function(angular, $) {
    "use strict";
    angular.module('FileManagerApp').controller('ModalFileManagerCtrl', [
        '$scope', '$rootScope', 'fileManagerConfig', 'fileNavigator',
        function($scope, $rootScope, fileManagerConfig, FileNavigator) {

        $scope.appName = fileManagerConfig.appName;
        $scope.orderProp = ['model.type', 'model.name'];
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