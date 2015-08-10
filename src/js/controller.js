(function(window, angular, $) {
    "use strict";
    angular.module('FileManagerApp').controller('FileManagerCtrl', [
    '$scope', '$translate', '$cookies', 'fileManagerConfig', 'item', 'fileNavigator', 'fileUploader',
    function($scope, $translate, $cookies, fileManagerConfig, Item, FileNavigator, FileUploader) {

        $scope.config = fileManagerConfig;
        $scope.appName = fileManagerConfig.appName;
        $scope.orderProp = ['model.type', 'model.name'];
        $scope.query = '';
        $scope.temp = new Item();
        $scope.fileNavigator = new FileNavigator();
        $scope.fileUploader = FileUploader;
        $scope.uploadFileList = [];
        $scope.viewTemplate = $cookies.viewTemplate || 'main-table.html';

        $scope.setTemplate = function(name) {
            $scope.viewTemplate = $cookies.viewTemplate = name;
        };

        $scope.changeLanguage = function (locale) {
            if (locale) {
                return $translate.use($cookies.language = locale);
            }
            $translate.use($cookies.language || fileManagerConfig.defaultLang);
        };

        $scope.touch = function(item) {
            item = item instanceof Item ? item : new Item();
            item.revert && item.revert();
            $scope.temp = item;
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
                item.error = $translate.instant('error_invalid_filename');
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
            }, function() {
                item.success = false;
            });
        };

        $scope.extract = function(item) {
            item.extract(function() {
                item.success = true;
                $scope.fileNavigator.refresh();
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
                item.error = $translate.instant('error_invalid_filename');
                return false;
            }
            item.rename(function() {
                $scope.fileNavigator.refresh();
                $('#rename').modal('hide');
            });
        };

        $scope.createFolder = function(item) {
            var name = item.tempModel.name && item.tempModel.name.trim();
            item.tempModel.type = 'dir';
            item.tempModel.path = $scope.fileNavigator.currentPath;
            if (name && !$scope.fileNavigator.fileNameExists(name)) {
                item.createFolder(function() {
                    $scope.fileNavigator.refresh();
                    $('#newfolder').modal('hide');
                });
            } else {
                $scope.temp.error = $translate.instant('error_invalid_filename');
                return false;
            }
        };

        $scope.uploadFiles = function() {
            $scope.fileUploader.upload($scope.uploadFileList, $scope.fileNavigator.currentPath).success(function() {
                $scope.fileNavigator.refresh();
                $('#uploadfile').modal('hide');
            }).error(function(data) {
                var errorMsg = data.result && data.result.error || $translate.instant('error_uploading_files');
                $scope.temp.error = errorMsg;
            });
        };

        $scope.getQueryParam = function(param) {
            var found;
            window.location.search.substr(1).split("&").forEach(function(item) {
                if (param ===  item.split("=")[0]) {
                    found = item.split("=")[1];
                    return false;
                }
            });
            return found;
        };

        $scope.changeLanguage($scope.getQueryParam('lang'));
        $scope.isWindows = $scope.getQueryParam('server') === 'Windows';
        $scope.fileNavigator.refresh();

    }]);
})(window, angular, jQuery);
