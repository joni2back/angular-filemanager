/*!
 * Angular FileManager v0.8 (https://github.com/joni2back/angular-filemanager)
 * Jonas Sciangula Street <joni2back@gmail.com>
 * Licensed under MIT (https://github.com/joni2back/angular-filemanager/blob/master/LICENSE)
 */

FileManagerApp.controller('ModalFileManagerCtrl', [
    '$scope', '$rootScope', '$config', 'fileNavigator',
    function($scope, $rootScope, $config, FileNavigator) {

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