/*!
 * Javascript Filemanager developed with AngularJS and Bootstrap
 *
 * @author  Jonas Sciangula Street <joni2back@gmail.com>
 * @version v0.8
 */

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