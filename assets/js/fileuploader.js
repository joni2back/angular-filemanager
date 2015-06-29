(function(window, angular) {
    "use strict";
    angular.module('FileManagerApp').service('fileUploader', ['$http', 'fileManagerConfig', function ($http, fileManagerConfig) {

        var self = this;
        self.requesting = false; 
        self.upload = function(fileList, path, success, error) {
            var form = new window.FormData();

            var fileObj, data;
            data = {
                params: {
                    destination: '/' + path.join('/'),
                    fileInfos: fileList
                }
            };
            if (fileList.length == 1) {
                form.append('file', fileList[0]);
            } else {
                for (var file in fileList) {
                    fileObj = fileList[file];
                    form.append('file-' + (1 + parseInt(file, null)), fileObj);
                }
            }

            self.requesting = true;
            return $http.post(fileManagerConfig.uploadUrl, angular.extend(form, data), {
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