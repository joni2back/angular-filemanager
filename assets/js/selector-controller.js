FileManagerApp.controller('ModalFileManagerCtrl', [
    '$scope', '$rootScope', '$config', 'item', 'fileNavigator',
    function($scope, $rootScope, $config, Item, FileNavigator) {

    $scope.appName = $config.appName;
    $scope.orderProp = ['model.type', 'model.name'];
    $scope.fileNavigator = new FileNavigator();

    $rootScope.selected = new Item();

    $scope.touch = function(item) {
        item = (item && item.revert && item) || new Item();
        $rootScope.selected = item;
        $('#selector').modal('hide');
    };

    $scope.untouch = function() {
        $scope.touch(null);
    };

    $rootScope.openNavigator = function() {
        $scope.untouch();
        $('#selector').modal('show');
    };

    $scope.fileNavigator.refresh();
}]);