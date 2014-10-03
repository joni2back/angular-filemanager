FileManagerApp.controller('FileManagerCtrl', ['$scope', 'item', 'fileNavigator', 'fileUploader', function($scope, Item, FileNavigator, FileUploader) {

    $scope.orderProp = ['model.type', 'model.name'];
    $scope.temp = new Item();
    $scope.fileNavigator = new FileNavigator();
    $scope.fileUploader = FileUploader;
    $scope.myFiles = null;

    $scope.touch = function(item) {
        item.error = '';
        $scope.temp = item;
    };

    $scope.copy = function(item) {
        var newItem = angular.copy(item);
        while ($scope.fileNavigator.fileNameExists(newItem.model.name)) {
            newItem.model.name += '_copy';
        }
        $scope.fileNavigator.fileList.push(newItem);
        $('#copy').modal('hide');
    };

    $scope.delete = function(item) {
        item.delete(function() {
            $scope.fileNavigator.refresh();
            $('#delete').modal('hide');
        });
    };

    $scope.createFolder = function(name) {
        name = name.trim();
        if (name && !$scope.fileNavigator.fileNameExists(name)) {
            var item = new Item({name: name, type: 'dir'}, $scope.fileNavigator.currentPath);
            $scope.fileNavigator.fileList.push(item);
        }
        $('#newfolder').modal('hide');
    };

    $scope.createFile = function(name, content) {
        name = name.trim();
        if (name && !$scope.fileNavigator.fileNameExists(name)) {
            var item = new Item({name: name, type: 'file', content: content}, $scope.fileNavigator.currentPath);
            $scope.fileNavigator.fileList.push(item);
        }
        $('#newfile').modal('hide');
    };

    $scope.uploadFiles = function() {
        $scope.fileUploader.upload($scope.uploadfiles, $scope.fileNavigator.currentPath, function() {
            $scope.fileNavigator.refresh();
            $('#uploadfile').modal('hide');
        });
    };

    $scope.fileNavigator.refresh();
}]);