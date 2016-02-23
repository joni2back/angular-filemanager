(function(window, angular) {
    'use strict';
    angular.module('FileManagerApp').service('apiHandler', ['$http', '$q', '$translate', 'fileManagerConfig', 
        function ($http, $q, $translate, fileManagerConfig) {

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

        ApiHandler.prototype.copy = function(files, to) {
            
            window.console.info(files, to);

            var none = [$http, $q, fileManagerConfig];
            window.console.warning = none;
            return {then:function(){}};
        };

        ApiHandler.prototype.move = function(files, to) {
            
            window.console.info(files, to);

            return {then:function(){}};
        };


        ApiHandler.prototype.getFileList = function(files) {
            return (files || []).map(function(file) {
                return file && file.model.fullPath();
            });
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
            if (! window.FormData) {
                throw new Error('Unsupported browser version');
            }
            var self = this;
            var form = new window.FormData();
            var deferred = $q.defer();
            form.append('destination', '/' + path.join('/'));

            for (var i = 0; i < fileList.length; i++) {
                var fileObj = fileList.item(i);
                fileObj instanceof window.File && form.append('file-' + i, fileObj);
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
})(window, angular);