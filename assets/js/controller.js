/*!
 * Angular FileManager v0.8 (https://github.com/joni2back/angular-filemanager)
 * Jonas Sciangula Street <joni2back@gmail.com>
 * Licensed under MIT (https://github.com/joni2back/angular-filemanager/blob/master/LICENSE)
 */

FileManagerApp.controller('FileManagerCtrl', [
    '$scope', '$translate', '$cookies', '$config', 'item', 'fileNavigator', 'fileUploader',
    function($scope, $translate, $cookies, $config, Item, FileNavigator, FileUploader) {

    $scope.appName = $config.appName;
    $scope.orderProp = ['model.type', 'model.name'];
    $scope.query = '';
    $scope.temp = new Item();
    $scope.fileNavigator = new FileNavigator();
    $scope.fileUploader = FileUploader;
    $scope.uploadFileList = [];
    $scope.viewTemplate = $cookies.viewTemplate || 'main-icons.html';
    $scope.language = $cookies.language || 'en';

    $translate.use($scope.language);
    $scope.fileNavigator.refresh();

    $scope.setTemplate = function(name) {
        $scope.viewTemplate = $cookies.viewTemplate = name;
    };

    $scope.changeLanguage = function (locale) {
        $scope.language = $cookies.language = locale;
        $translate.use(locale);
    };

    $scope.touch = function(item) {
        item = (item && item.revert && item) || new Item();
        item.revert && item.revert();
        $scope.temp = item;
    };

    $scope.smartRightClick = function(item) {
        var $contextMenu = $("#context-menu").hide();
        var selectors = ".main-navigation .table-files td a, .iconset a.thumbnail";
        $scope.touch(item);
        $(window.document).on("contextmenu", selectors, function(e) {
            $contextMenu.css({
                left: e.pageX,
                top: e.pageY
            }).show();
            e.preventDefault();
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
        var samePath = item.tempModel.path.join() === item.model.path.join();
        if (samePath && $scope.fileNavigator.fileNameExists(item.tempModel.name)) {
            item.error = $config.msg.invalidFilename;
            return false;
        }
        item.copy(function() {
            $scope.fileNavigator.refresh();
            $('#copy').modal('hide');
        });
    };

    $scope.compress = function(item) {
        item.compress(function() {
            item.success = true;
            $scope.fileNavigator.refresh();
            //$('#compress').modal('hide');
        }, function() {
            item.success = false;
        });
    };

    $scope.extract = function(item) {
        item.extract(function() {
            item.success = true;
            $scope.fileNavigator.refresh();
            //$('#extract').modal('hide');
        }, function() {
            item.success = false;
        });
    };

    $scope.remove = function(item) {
        item.remove(function() {
            $scope.fileNavigator.refresh();
            $('#delete').modal('hide');
        });
    };

    $scope.rename = function(item) {
        var samePath = item.tempModel.path.join() === item.model.path.join();
        if (samePath && $scope.fileNavigator.fileNameExists(item.tempModel.name)) {
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
}]);