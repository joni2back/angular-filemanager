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

        ApiHandler.prototype.list = function(path) {
            var self = this;
            var deferred = $q.defer();
            var data = {params: {
                mode: 'list',
                onlyFolders: false,
                path: '/' + path
            }};

            self.inprocess = true;
            self.error = '';

            $http.post(fileManagerConfig.listUrl, data).success(function(data) {
                self.deferredHandler(data, deferred);
            }).error(function(data) {
                self.deferredHandler(data, deferred, 'Unknown error listing, check the response');
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

        return new ApiHandler;

    }]);
})(window, angular);