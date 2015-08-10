(function(window, angular) {
    "use strict";
    angular.module('FileManagerApp').service('fileUploader', ['$http', 'fileManagerConfig', function ($http, fileManagerConfig) {

        var self = this;
        self.requesting = false; 
        self.upload = function(fileList, path) {
            var form = new window.FormData();  
            form.append('destination', '/' + path.join('/'));

            for (var i = 0; i < fileList.length; i++) {
                var fileObj = fileList.item(i);
                fileObj instanceof window.File && form.append('file-' + i, fileObj);
            }

            self.requesting = true;
            return $http.post(fileManagerConfig.uploadUrl, form, {
                transformRequest: angular.identity,
                headers: {
                    "Content-Type": undefined
                }
            }).success(function(data) {
                self.requesting = false;
            }).error(function(data) {
                self.requesting = false;
            });
        };
    }]);
})(window, angular);