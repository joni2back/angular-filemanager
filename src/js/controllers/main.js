(function(window, angular, $) {
    'use strict';
    angular.module('FileManagerApp').controller('FileManagerCtrl', [
        '$scope', '$rootScope', '$translate', '$cookies', 'fileManagerConfig', 'item', 'fileNavigator', 'fileUploader', 'apiHandler',
        function($scope, $rootScope, $translate, $cookies, fileManagerConfig, Item, FileNavigator, FileUploader, ApiHandler) {

        $scope.config = fileManagerConfig;
        $scope.reverse = false;
        $scope.predicate = ['model.type', 'model.name'];        
        $scope.order = function(predicate) {
            $scope.reverse = ($scope.predicate[1] === predicate) ? !$scope.reverse : false;
            $scope.predicate[1] = predicate;
        };

        $scope.query = '';
        $scope.temp = new Item();
        $scope.fileNavigator = new FileNavigator();
        $scope.fileUploader = FileUploader;
        $scope.uploadFileList = [];
        $scope.viewTemplate = $cookies.get('viewTemplate') || 'main-table.html';
        $scope.temps = [];

        $scope.setTemplate = function(name) {
            $cookies.put('viewTemplate', name);
            $scope.viewTemplate = name;
        };

        $scope.changeLanguage = function (locale) {
            if (locale) {
                $cookies.put('language', locale);
                return $translate.use(locale);
            }
            $translate.use($cookies.get('language') || fileManagerConfig.defaultLang);
        };

        $scope.touch = function(item) {
            window.item = item;
            /*
            item = item instanceof Item ? item : new Item();
            item.revert();
            $scope.temp = item;
            $rootScope.selectedPath = $scope.fileNavigator.currentPath;
            */
            //$scope.selectOrUnselect(item);
        };

        $scope.selectOrUnselect = function(item, $event) {
            var isRightClick = $event && $event.which == 3;

            if (isRightClick && $scope.isSelected(item)) {
                return;
            }

            if ($event && $event.ctrlKey && !isRightClick) {
                $scope.isSelected(item) ? $scope.temps.pop(item) : $scope.temps.push(item);
                return;
            }

            $scope.temps = [item];
        };

        $scope.isSelected = function(item) {
            return $scope.temps.indexOf(item) !== -1;
        };

        $scope.singleSelection = function() {
            return $scope.temps.length === 1 ? $scope.temps[0] : false;
        };

        $scope.selectionHas = function(type) {
            return $scope.temps.find(function(item) {
                return item.model.type === type;
            });
        };
window.scope = $scope;
        $scope.smartClick = function(item) {
            if (item.isFolder()) {
                return $scope.fileNavigator.folderClick(item);
            }
            if (item.isImage()) {
                if ($scope.config.previewImagesInModal) {
                    return $scope.openImagePreview(item);
                } 
                return item.download(true);
            }
            if (item.isEditable()) {
                return $scope.openEditItem(item);
            }
        };

        $scope.openImagePreview = function(item) {
            item.inprocess = true;
            $scope.modal('imagepreview')
                .find('#imagepreview-target')
                .attr('src', item.getUrl(true))
                .unbind('load error')
                .on('load error', function() {
                    item.inprocess = false;
                    $scope.$apply();
                });
            return $scope.touch(item);
        };

        $scope.openEditItem = function(item) {
            item.getContent();
            $scope.modal('edit');
            return $scope.touch(item);
        };

        $scope.modal = function(id, hide) {
            return $('#' + id).modal(hide ? 'hide' : 'show');
        };

        $scope.isInThisPath = function(path) {
            var currentPath = $scope.fileNavigator.currentPath.join('/');
            return currentPath.indexOf(path) !== -1;
        };

        $scope.edit = function(item) {
            item.edit().then(function() {
                $scope.modal('edit', true);
            });
        };

        $scope.changePermissions = function(item) {
            item.changePermissions().then(function() {
                $scope.modal('changepermissions', true);
            });
        };

        $scope.copy = function() {
            ApiHandler.copy($scope.temps, $rootScope.selectedPath).then(function() {
                $scope.fileNavigator.refresh();
                $scope.modal('copy', true);
            });
        };

        $scope.copyOld = function(item) {
            var samePath = item.tempModel.path.join() === item.model.path.join();
            if (samePath && $scope.fileNavigator.fileNameExists(item.tempModel.name)) {
                item.error = $translate.instant('error_invalid_filename');
                return false;
            }
            item.copy().then(function() {
                $scope.fileNavigator.refresh();
                $scope.modal('copy', true);
            });
        };

        $scope.compress = function(item) {
            item.compress().then(function() {
                $scope.fileNavigator.refresh();
                if (! $scope.config.compressAsync) {
                    return $scope.modal('compress', true);
                }
                item.asyncSuccess = true;
            }, function() {
                item.asyncSuccess = false;
            });
        };

        $scope.extract = function(item) {
            item.extract().then(function() {
                $scope.fileNavigator.refresh();
                if (! $scope.config.extractAsync) {
                    return $scope.modal('extract', true);
                }
                item.asyncSuccess = true;
            }, function() {
                item.asyncSuccess = false;
            });
        };

        $scope.remove = function(item) {
            item.remove().then(function() {
                $scope.fileNavigator.refresh();
                $scope.modal('delete', true);
            });
        };

        $scope.rename = function(item) {
            var samePath = item.tempModel.path.join() === item.model.path.join();
            if (samePath && $scope.fileNavigator.fileNameExists(item.tempModel.name)) {
                item.error = $translate.instant('error_invalid_filename');
                return false;
            }
            item.rename().then(function() {
                $scope.fileNavigator.refresh();
                $scope.modal('rename', true);
            });
        };

        $scope.createFolder = function(item) {
            var name = item.tempModel.name && item.tempModel.name.trim();
            item.tempModel.type = 'dir';
            item.tempModel.path = $scope.fileNavigator.currentPath;
            if (name && !$scope.fileNavigator.fileNameExists(name)) {
                item.createFolder().then(function() {
                    $scope.fileNavigator.refresh();
                    $scope.modal('newfolder', true);
                });
            } else {
                item.error = $translate.instant('error_invalid_filename');
                return false;
            }
        };

        $scope.uploadFiles = function() {
            $scope.fileUploader.upload($scope.uploadFileList, $scope.fileNavigator.currentPath).then(function() {
                $scope.fileNavigator.refresh();
                $scope.modal('uploadfile', true);
            }, function(data) {
                var errorMsg = data.result && data.result.error || $translate.instant('error_uploading_files');
                $scope.temp.error = errorMsg;
            });
        };

        $scope.getQueryParam = function(param) {
            var found;
            window.location.search.substr(1).split('&').forEach(function(item) {
                if (param ===  item.split('=')[0]) {
                    found = item.split('=')[1];
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
