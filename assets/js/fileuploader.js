(function(window, angular) {
    "use strict";
    angular.module('FileManagerApp').service('fileUploader', ['$http', 'fileManagerConfig', function ($http, fileManagerConfig) {

        var self = this;
        self.requesting = false; 
        self.upload = function(fileList, path, success, error) {
            var form = new window.FormData();
 
            form.append('destination', '/' + path.join('/'));
            for (var file in fileList) {
                var fileObj = fileList[file];
                typeof fileObj === 'object' && form.append('file-' + (1 + parseInt(file, null)), fileObj);
            }

            self.requesting = true;
            return $http.post(fileManagerConfig.uploadUrl, form, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).success(function(data) {
                self.requesting = false;
                typeof success === 'function' && success(data);
            }).error(function(data) {
                self.requesting = false;
                typeof error === 'function' && error(data);
            });
        };
    }]);
})(window, angular);