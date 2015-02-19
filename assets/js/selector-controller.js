FileManagerApp.controller('ModalFileManagerCtrl', [
    '$scope', '$rootScope', '$config', 'item', 'fileNavigator',
    function($scope, $rootScope, $config, Item, FileNavigator) {

    $scope.appName = $config.appName;
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