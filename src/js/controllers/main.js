(function(angular, $) {
    'use strict';
    angular.module('FileManagerApp').controller('FileManagerCtrl', [
        '$scope', '$rootScope', '$window', '$translate', 'fileManagerConfig', 'item', 'fileNavigator', 'apiHandler',
        function($scope, $rootScope, $window, $translate, fileManagerConfig, Item, FileNavigator, ApiHandler) {

        var $storage = $window.localStorage;

        $scope.config = fileManagerConfig;
        $scope.reverse = false;
        $scope.predicate = ['model.type', 'model.name'];        
        $scope.order = function(predicate) {
            $scope.reverse = ($scope.predicate[1] === predicate) ? !$scope.reverse : false;
            $scope.predicate[1] = predicate;
        };
        $scope.query = '';
        $scope.fileNavigator = new FileNavigator();
        $scope.apiHandler = new ApiHandler();
        $scope.uploadFileList = [];
        $scope.viewTemplate = $storage.getItem('viewTemplate') || 'main-table.html';
        $scope.fileList = [];
        $scope.temps = [];

        $scope.$watch('temps', function() {
            if ($scope.singleSelection()) {
                $scope.chmodEdit = $scope.singleSelection();
            } else {
                $scope.chmodEdit = new Item({rights: 644});
                $scope.chmodEdit.multiple = true;
            }
        });

        $scope.fileNavigator.onRefresh = function() {
            $scope.temps = [];
            $rootScope.selectedModalPath = $scope.fileNavigator.currentPath;
        };

        $scope.setTemplate = function(name) {
            $storage.setItem('viewTemplate', name);
            $scope.viewTemplate = name;
        };

        $scope.changeLanguage = function (locale) {
            if (locale) {
                $storage.setItem('language', locale);
                return $translate.use(locale);
            }
            $translate.use($storage.getItem('language') || fileManagerConfig.defaultLang);
        };

        $scope.selectOrUnselect = function(item, $event) {
            var indexInTemp = $scope.temps.indexOf(item);
            var isRightClick = $event && $event.which == 3;

            if ($event && $event.target.hasAttribute('prevent')) {
                $scope.temps = [];
                return;
            }

            if (! item) {
                return;
            }

            if (isRightClick && $scope.isSelected(item)) {
                return;
            }

            if ($event && $event.shiftKey && !isRightClick) {
                var list = $scope.fileList;
                //var list = $scope.fileNavigator.fileList;
                var indexInList = list.indexOf(item);
                var lastSelected = $scope.temps[0];
                var i = list.indexOf(lastSelected);
                var current = undefined;

                if (lastSelected && list.indexOf(lastSelected) < indexInList) {
                    $scope.temps = [];
                    while (i <= indexInList) {
                        current = list[i];
                        !$scope.isSelected(current) && $scope.temps.push(current);
                        i++;
                    }
                    return;
                }

                if (lastSelected && list.indexOf(lastSelected) > indexInList) {
                    $scope.temps = [];
                    while (i >= indexInList) {
                        current = list[i];
                        !$scope.isSelected(current) && $scope.temps.push(current);
                        i--;
                    }
                    return;
                }
            }

            if ($event && $event.ctrlKey && !isRightClick) {
                $scope.isSelected(item) ? $scope.temps.splice(indexInTemp, 1) : $scope.temps.push(item);
                return;
            }

            $scope.temps = [item];
        };

        $scope.isSelected = function(item) {
            return $scope.temps.indexOf(item) !== -1;
        };

        $scope.singleSelection = function() {
            return $scope.temps.length === 1 && $scope.temps[0];
        };

        $scope.totalSelecteds = function() {
            return {
                total: $scope.temps.length
            };
        };

        $scope.selectionHas = function(type) {
            return $scope.temps.find(function(item) {
                return item && item.model.type === type;
            });
        };

        $scope.prepareNewFolder = function() {
            var item = new Item(null, $scope.fileNavigator.currentPath);
            $scope.temps = [item];
            return item;
        };

        $scope.smartClick = function(item) {
            if (item.isFolder()) {
                return $scope.fileNavigator.folderClick(item);
            }
            if (item.isImage()) {
                if ($scope.config.previewImagesInModal) {
                    return $scope.openImagePreview(item);
                } 
                return $scope.apiHandler.download(item, true);
            }
            if (item.isEditable()) {
                return $scope.openEditItem(item);
            }
        };

        $scope.openImagePreview = function() {
            var item = $scope.singleSelection();
            $scope.apiHandler.inprocess = true;
            $scope.modal('imagepreview', null, true)
                .find('#imagepreview-target')
                .attr('src', $scope.apiHandler.getUrl(item, true))
                .unbind('load error')
                .on('load error', function() {
                    $scope.apiHandler.inprocess = false;
                    $scope.$apply();
                });
        };

        $scope.openEditItem = function() {
            var item = $scope.singleSelection();
            $scope.apiHandler.getContent(item).then(function(data) {
                item.tempModel.content = item.model.content = data.result;
            });
            $scope.modal('edit');
        };

        $scope.modal = function(id, hide, returnElement) {
            var element = $('#' + id);
            element.modal(hide ? 'hide' : 'show');
            $scope.apiHandler.error = '';
            return returnElement ? element : true;
        };

        $scope.modalWithPathSelector = function(id) {
            $rootScope.selectedModalPath = $scope.fileNavigator.currentPath;
            return $scope.modal(id);
        };

        $scope.isInThisPath = function(path) {
            var currentPath = $scope.fileNavigator.currentPath.join('/');
            return currentPath.indexOf(path) !== -1;
        };

        $scope.edit = function() {
            var item = $scope.singleSelection();
            var content = item.tempModel.content;
            $scope.apiHandler.edit(item, content).then(function() {
                $scope.modal('edit', true);
            });
        };

        $scope.changePermissions = function() {
            var item = $scope.chmodEdit;
            var code = item.tempModel.perms.toCode();
            var octal = item.tempModel.perms.toOctal();
            var recursive = item.tempModel.recursive;
            $scope.apiHandler.changePermissions($scope.temps, octal, code, recursive).then(function() {
                $scope.modal('changepermissions', true);
            });
        };

        $scope.download = function(item) {
            $scope.apiHandler.download(item);
        };

        $scope.copy = function() {
            var item = $scope.singleSelection();
            if (item) {
                var nameExists = $scope.fileNavigator.fileNameExists(item.tempModel.name);
                var hasName = item.tempModel.name.trim();
                if (nameExists && $scope.validateSamePath(item)) {
                    $scope.apiHandler.error = $translate.instant('error_invalid_filename');
                    return false;
                }
                if (!hasName) {
                    $scope.apiHandler.error = $translate.instant('error_invalid_filename');
                    return false;
                }
            }
            $scope.apiHandler.copy($scope.temps, $rootScope.selectedModalPath).then(function() {
                $scope.fileNavigator.refresh();
                $scope.modal('copy', true);
            });
        };

        $scope.compress = function() {
            $scope.apiHandler.compress($scope.temps, $rootScope.selectedModalPath).then(function() {
                $scope.fileNavigator.refresh();
                if (! $scope.config.compressAsync) {
                    return $scope.modal('compress', true);
                }
                $scope.apiHandler.asyncSuccess = true;
            }, function() {
                $scope.apiHandler.asyncSuccess = false;
            });
        };

        $scope.extract = function() {
            var item = $scope.singleSelection();
            $scope.apiHandler.extract(item, $rootScope.selectedModalPath).then(function() {
                $scope.fileNavigator.refresh();
                if (! $scope.config.extractAsync) {
                    return $scope.modal('extract', true);
                }
                $scope.apiHandler.asyncSuccess = true;
            }, function() {
                $scope.apiHandler.asyncSuccess = false;
            });
        };

        $scope.remove = function() {
            $scope.apiHandler.remove($scope.temps).then(function() {
                $scope.fileNavigator.refresh();
                $scope.modal('delete', true);
            });
        };

        $scope.move = function() {           
            var anyItem = $scope.singleSelection() || $scope.temps[0];
            if (anyItem && $scope.validateSamePath(anyItem)) {
                $scope.apiHandler.error = $translate.instant('error_cannot_move_same_path');
                return false;
            }
            $scope.apiHandler.move($scope.temps, $rootScope.selectedModalPath).then(function() {
                $scope.fileNavigator.refresh();
                $scope.modal('move', true);
            });
        };

        $scope.rename = function() {
            var item = $scope.singleSelection();
            var samePath = item.tempModel.path.join() === item.model.path.join();
            if (samePath && $scope.fileNavigator.fileNameExists(item.tempModel.name)) {
                $scope.apiHandler.error = $translate.instant('error_invalid_filename');
                return false;
            }
            $scope.apiHandler.rename(item).then(function() {
                $scope.fileNavigator.refresh();
                $scope.modal('rename', true);
            });
        };

        $scope.createFolder = function() {
            var item = $scope.singleSelection();
            var name = item.tempModel.name && item.tempModel.name.trim();
            var path = item.model.path;
            if (name && !$scope.fileNavigator.fileNameExists(name)) {
                $scope.apiHandler.createFolder(name, path).then(function() {
                    $scope.fileNavigator.refresh();
                    $scope.modal('newfolder', true);
                });
            } else {
                $scope.apiHandler.error = $translate.instant('error_invalid_filename');
                return false;
            }
        };

        $scope.uploadFiles = function() {
            $scope.apiHandler.upload($scope.uploadFileList, $scope.fileNavigator.currentPath).then(function() {
                $scope.fileNavigator.refresh();
                $scope.modal('uploadfile', true);
            }, function(data) {
                var errorMsg = data.result && data.result.error || $translate.instant('error_uploading_files');
                $scope.apiHandler.error = errorMsg;
            });
        };

        $scope.validateSamePath = function(item) {
            var selectedPath = $rootScope.selectedModalPath.join('/').replace(/^\//, '');
            var selectedItemsPath = item && item.model.path.join('/').replace(/^\//, '');
            return selectedItemsPath === selectedPath;
        };

        $scope.getQueryParam = function(param) {
            var found;
            $window.location.search.substr(1).split('&').forEach(function(item) {
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
        $window.scope = $scope; //dev
        $window.rootScope = $rootScope; //dev
    }]);
})(angular, jQuery);
