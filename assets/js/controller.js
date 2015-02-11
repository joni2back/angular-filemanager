FileManagerApp.controller('FileManagerCtrl', [
    '$scope', '$config', 'item', 'fileNavigator', 'fileUploader',
    function($scope, $config, Item, FileNavigator, FileUploader) {

    $scope.appName = $config.appName;
    $scope.orderProp = ['model.type', 'model.name'];
    $scope.temp = new Item();
    $scope.fileNavigator = new FileNavigator();
    $scope.fileUploader = FileUploader;
    $scope.uploadFileList = [];

    $scope.touch = function(item) {
        item.revert && item.revert();
        $scope.temp = item;
    };

    $scope.smartRightClick = function(item) {
        $scope.temp = item;
        var $contextMenu = $("#contextMenu").hide();
        $(document).click(function() {
            $contextMenu.hide();
        });
        $("body").on("contextmenu", "tr td", function(e) {
            $contextMenu.css({
                left: e.pageX,
                top: e.pageY
            }).show();
            return false;
        });
    };

    $scope.smartClick = function(item) {
        var self = this;
        if (item.isFolder()) {
            return $scope.fileNavigator.folderClick(item);
        };
        if (item.isImage()) {
            return item.preview();
        }
        if (item.isEditable()) {
            $('#edit').modal('show');
            item.getContent();
            self.touch(item);
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

    $scope.createFolder = function(name) {
        name = name && name.trim();
        if (name && !$scope.fileNavigator.fileNameExists(name)) {
            $scope.fileNavigator.fileList.push(new Item(
                {name: name, type: 'dir'},
                $scope.fileNavigator.currentPath
            ));
        } else {
            $scope.temp.error = $config.msg.invalidFilename;
            return false;
        }
        $('#newfolder').modal('hide');
    };

    $scope.createFile = function(name, content) {
        name = name && name.trim();
        if (name && !$scope.fileNavigator.fileNameExists(name)) {
            $scope.fileNavigator.fileList.push(new Item(
                {name: name, type: 'file', content: content},
                $scope.fileNavigator.currentPath
            ));
        } else {
            $scope.temp.error = $config.msg.invalidFilename;
            return false;
        }
        $('#newfile').modal('hide');
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