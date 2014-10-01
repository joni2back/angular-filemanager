var fileManager = angular.module('fileManagerApp', []);
fileManager.controller('FileManagerCtrl', function ($scope, $http) {

    $scope.orderProp = ['type', 'name'];
    $scope.temp = {ori: {}, new: {}};
    $scope.requesting = false;

    $scope.refresh = function(success, error) {
        $scope.requesting = true;
        $http.get('files.json').success(function(data) {
            $scope.fileList = data.files;
            $scope.currentPath = data.path;
            typeof success === 'function' && success(data);
            $scope.requesting = false;
        }).error(function(data) {
            typeof error === 'function' && error(data);
            $scope.requesting = false;
        });
    };

    $scope.touch = function(tempItem) {
        $scope.temp.ori = tempItem || {};
        $scope.temp.new = angular.copy(tempItem) || {};
    };

    $scope.delete = function(tempItem) {
        var id = $scope.fileList.indexOf(tempItem.ori);
        $scope.fileList.splice(id, 1);
        $('#delete').modal('hide');
    };

    $scope.rename = function(tempItem) {
        tempItem.ori.name = $scope.temp.new.name || tempItem.ori.name;
        $('#rename').modal('hide');
    };

    $scope.copy = function(tempItem) {
        while ($scope.fileNameExists(tempItem.new.name)) {
            tempItem.new.name += '_copy';
        }
        $scope.fileList.push(tempItem.new);
        $('#copy').modal('hide');
    };

    $scope.edit = function(tempItem) {
        tempItem.ori.content = $scope.temp.new.content;
        $('#edit').modal('hide');
    };

    $scope.createFolder = function(name) {
        if (name.trim()) {
            var item = {
                type: 'dir',
                name: name,
                size: 0,
                date: new Date()
            };
            $scope.fileList.push(item);
        }
        $('#newfolder').modal('hide');
    };

    $scope.fileNameExists = function(fileName) {
        for (item in $scope.fileList) {
            item = $scope.fileList[item];
            if (item.name === fileName) {
                return true;
            }
        }
    };

    $scope.isFolder = function(item) {
        return item.type === 'dir';
    };

    $scope.isEditable = function(item) {
        return !!item.name.match('\.txt$');
    };

    $scope.isCompressible = function(item) {
        return $scope.isFolder(item);
    };

    $scope.isExtractable = function(item) {
        return !!(!$scope.isFolder(item) && item.name.match('\.(zip|gz|tar|rar|gzip)$'));
    };

    $scope.refresh();
});
