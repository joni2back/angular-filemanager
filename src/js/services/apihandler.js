(function(angular, $) {
    'use strict';
    angular.module('FileManagerApp').service('apiHandler', ['$http', '$q', '$window', '$translate', 'fileManagerConfig', 
        function ($http, $q, $window, $translate, fileManagerConfig) {

        $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

        var ApiHandler = function() {
            this.inprocess = false;
            this.error = '';
        };

        ApiHandler.prototype.deferredHandler = function(data, deferred, defaultMsg) {
            if (!data || typeof data !== 'object') {
                this.error = 'Bridge response error, please check the docs';
            }
            if (data.result && data.result.error) {
                this.error = data.result.error;
            }
            if (!this.error && data.error) {
                this.error = data.error.message;
            }
            if (!this.error && defaultMsg) {
                this.error = defaultMsg;
            }
            if (this.error) {
                return deferred.reject(data);
            }
            return deferred.resolve(data);
        };

        ApiHandler.prototype.list = function(path, customDeferredHandler) {
            var self = this;
            var dfHandler = customDeferredHandler || self.deferredHandler;
            var deferred = $q.defer();
            var data = {params: {
                mode: 'list',
                onlyFolders: false,
                path: '/' + path
            }};

            self.inprocess = true;
            self.error = '';

            $http.post(fileManagerConfig.listUrl, data).success(function(data) {
                dfHandler(data, deferred);
            }).error(function(data) {
                dfHandler(data, deferred, 'Unknown error listing, check the response');
            })['finally'](function() {
                self.inprocess = false;
            });
            return deferred.promise;
        };

        ApiHandler.prototype.copy = function(files, path) {
            var self = this;
            var deferred = $q.defer();
            var fileList = self.getFileList(files);
            var data = {params: {
                mode: 'copy',
                items: fileList,
                newPath: '/' + path.join('/')
            }};

            self.inprocess = true;
            self.error = '';
            $http.post(fileManagerConfig.copyUrl, data).success(function(data) {
                self.deferredHandler(data, deferred);
            }).error(function(data) {
                self.deferredHandler(data, deferred, $translate.instant('error_copying'));
            })['finally'](function() {
                self.inprocess = false;
            });
            return deferred.promise;
        };

        ApiHandler.prototype.move = function(files, path) {
            var self = this;
            var deferred = $q.defer();
            var fileList = self.getFileList(files);
            var data = {params: {
                mode: 'move',
                items: fileList,
                newPath: '/' + path.join('/')
            }};
            self.inprocess = true;
            self.error = '';
            $http.post(fileManagerConfig.renameUrl, data).success(function(data) {
                self.deferredHandler(data, deferred);
            }).error(function(data) {
                self.deferredHandler(data, deferred, $translate.instant('error_renaming'));
            })['finally'](function() {
                self.inprocess = false;
            });
            return deferred.promise;
        };
        ApiHandler.prototype.getFileList = function(files) {
            return (files || []).map(function(file) {
                return file && file.model.fullPath();
            });
        };

        ApiHandler.prototype.getFilePath = function(item) {
            return item && item.model.fullPath();
        };

        ApiHandler.prototype.remove = function(files) {
            var self = this;
            var deferred = $q.defer();
            var fileList = self.getFileList(files);
            var data = {params: {
                mode: 'delete',
                items: fileList
            }};

            self.inprocess = true;
            self.error = '';
            $http.post(fileManagerConfig.removeUrl, data).success(function(data) {
                self.deferredHandler(data, deferred);
            }).error(function(data) {
                self.deferredHandler(data, deferred, $translate.instant('error_deleting'));
            })['finally'](function() {
                self.inprocess = false;
            });
            return deferred.promise;
        };

        ApiHandler.prototype.upload = function(fileList, path) {
            if (! $window.FormData) {
                throw new Error('Unsupported browser version');
            }
            var self = this;
            var form = new $window.FormData();
            var deferred = $q.defer();
            form.append('destination', '/' + path.join('/'));

            for (var i = 0; i < fileList.length; i++) {
                var fileObj = fileList.item(i);
                fileObj instanceof $window.File && form.append('file-' + i, fileObj);
            }

            self.inprocess = true;
            self.error = '';
            $http.post(fileManagerConfig.uploadUrl, form, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            }).success(function(data) {
                self.deferredHandler(data, deferred);
            }).error(function(data) {
                self.deferredHandler(data, deferred, 'Unknown error uploading files');
            })['finally'](function() {
                self.inprocess = false;
            });

            return deferred.promise;
        };

        ApiHandler.prototype.getContent = function(item) {
            var path = this.getFilePath(item);
            var self = this;
            var deferred = $q.defer();
            var data = {params: {
                mode: 'editfile',
                path: path
            }};

            self.inprocess = true;
            self.error = '';
            $http.post(fileManagerConfig.getContentUrl, data).success(function(data) {
                self.deferredHandler(data, deferred);
            }).error(function(data) {
                self.deferredHandler(data, deferred, $translate.instant('error_getting_content'));
            })['finally'](function() {
                self.inprocess = false;
            });
            return deferred.promise;
        };

        ApiHandler.prototype.edit = function(item, content) {
            var path = this.getFilePath(item);
            var self = this;
            var deferred = $q.defer();
            var data = {params: {
                mode: 'savefile',
                content: content,
                path: path
            }};

            self.inprocess = true;
            self.error = '';

            $http.post(fileManagerConfig.editUrl, data).success(function(data) {
                self.deferredHandler(data, deferred);
            }).error(function(data) {
                self.deferredHandler(data, deferred, $translate.instant('error_modifying'));
            })['finally'](function() {
                self.inprocess = false;
            });
            return deferred.promise;
        };

        ApiHandler.prototype.rename = function(item) {
            var path = this.getFilePath(item);
            var self = this;
            var deferred = $q.defer();
            var data = {params: {
                mode: 'rename',
                path: path,
                newPath: item.tempModel.fullPath()
            }};
            self.inprocess = true;
            self.error = '';
            $http.post(fileManagerConfig.renameUrl, data).success(function(data) {
                self.deferredHandler(data, deferred);
            }).error(function(data) {
                self.deferredHandler(data, deferred, $translate.instant('error_renaming'));
            })['finally'](function() {
                self.inprocess = false;
            });
            return deferred.promise;
        };

        ApiHandler.prototype.getUrl = function(item, preview) {
            var path = this.getFilePath(item);
            var data = {
                mode: 'download',
                preview: preview,
                path: path
            };
            return path && [fileManagerConfig.downloadFileUrl, $.param(data)].join('?');
        };

        ApiHandler.prototype.download = function(item, preview) {
            if (! item.isFolder()) {
                $window.open(this.getUrl(item, preview), '_blank', '');
            }
        };

        ApiHandler.prototype.createFolder = function(name, path) {
            var self = this;
            var deferred = $q.defer();
            var data = {params: {
                mode: 'addfolder',
                path: path.join('/') || '/',
                name: name
            }};

            self.inprocess = true;
            self.error = '';
            $http.post(fileManagerConfig.createFolderUrl, data).success(function(data) {
                self.deferredHandler(data, deferred);
            }).error(function(data) {
                self.deferredHandler(data, deferred, $translate.instant('error_creating_folder'));
            })['finally'](function() {
                self.inprocess = false;
            });
        
            return deferred.promise;
        };
        return ApiHandler;

    }]);
})(angular, jQuery);