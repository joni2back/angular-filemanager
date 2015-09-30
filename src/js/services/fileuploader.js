(function(window, angular) {
    'use strict';
    angular.module('FileManagerApp').service('fileUploader', ['$http', '$q', 'fileManagerConfig', function ($http, $q, fileManagerConfig) {

        function deferredHandler(data, deferred, errorMessage) {
            if (!data || typeof data !== 'object') {
                return deferred.reject('Bridge response error, please check the docs');
            }
            if (data.result && data.result.error) {
                return deferred.reject(data);
            }
            if (data.error) {
                return deferred.reject(data);
            }
            if (errorMessage) {
                return deferred.reject(errorMessage);
            }
            deferred.resolve(data);
        }

        this.requesting = false; 
        this.upload = function(fileList, path) {
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

            self.requesting = true;
            $http.post(fileManagerConfig.uploadUrl, form, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            }).success(function(data) {
                deferredHandler(data, deferred);
            }).error(function(data) {
                deferredHandler(data, deferred, 'Unknown error uploading files');
            })['finally'](function() {
                self.requesting = false;
            });

            return deferred.promise;
        };
    }]);
})(window, angular);