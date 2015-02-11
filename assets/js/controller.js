FileManagerApp.controller('FileManagerCtrl', [
    '$scope', '$config', 'item', 'fileNavigator', 'fileUploader',
    function($scope, $config, Item, FileNavigator, FileUploader) {

    $scope.appName = $config.appName;
    $scope.orderProp = ['model.type', 'model.name'];
    $scope.query = '';
    $scope.temp = new Item();
    $scope.fileNavigator = new FileNavigator();
    $scope.fileUploader = FileUploader;
    $scope.uploadFileList = [];
    $scope.viewMode = 'main-icons.html';

    $scope.touch = function(item) {
        item = (item && item.revert && item) || new Item();
        item.revert && item.revert();
        $scope.temp = item;
    };

    $scope.smartRightClick = function(item) {
        var $contextMenu = $("#context-menu").hide();
        $scope.touch(item);
        $(window.document).on("contextmenu", ".table-files td, .iconset a.thumbnail", function(e) {
            $contextMenu.css({
                left: e.pageX,
                top: e.pageY
            }).show();
            return false;
        });
    };

    $scope.smartClick = function(item) {
        if (item.isFolder()) {
            return $scope.fileNavigator.folderClick(item);
        };
        if (item.isImage()) {
            return item.preview();
        }
        if (item.isEditable()) {
            item.getContent();
            $scope.touch(item);
            $('#edit').modal('show');
            return;
        }
    };

    $scope.edit = function(item) {
        item.edit(function() {
            $('#edit').modal('hide');
        });
    };

    $scope.changePermissions = function(item) {
        item.changePermissions(function() {
            $('#changepermissions').modal('hide');
        });
    };

    $scope.copy = function(item) {
        var newItem = angular.copy(item);
        if ($scope.fileNavigator.fileNameExists(newItem.tempModel.name)) {
            item.error = $config.msg.invalidFilename;
            return false;
        }
        item.copy(function() {
            $scope.fileNavigator.refresh();
            $('#copy').modal('hide');
        });
    };

    $scope.delete = function(item) {
        item.delete(function() {
            $scope.fileNavigator.refresh();
            $('#delete').modal('hide');
        });
    };

    $scope.rename = function(item) {
        if ($scope.fileNavigator.fileNameExists(item.tempModel.name)) {
            item.error = $config.msg.invalidFilename;
            return false;
        }
        item.rename(function() {
            $scope.fileNavigator.refresh();
            $('#rename').modal('hide');
        });
    };

    $scope.createFolder = function(item) {
        name = item.tempModel.name && item.tempModel.name.trim();
        item.tempModel.type = 'dir';
        item.tempModel.path = $scope.fileNavigator.currentPath;
        if (name && !$scope.fileNavigator.fileNameExists(name)) {
            item.createFolder(function() {
                $scope.fileNavigator.refresh();
                $('#newfolder').modal('hide');
            });
        } else {
            $scope.temp.error = $config.msg.invalidFilename;
            return false;
        }
    };

    $scope.uploadFiles = function() {
        $scope.fileUploader.upload($scope.uploadFileList,
            $scope.fileNavigator.currentPath, function() {
            $scope.fileNavigator.refresh();
            $('#uploadfile').modal('hide');
        });
    };

    $scope.fileNavigator.refresh();
}]);