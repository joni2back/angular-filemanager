/*!
 * Javascript Filemanager developed with AngularJS and Bootstrap
 *
 * @author  Jonas Sciangula Street <joni2back@gmail.com>
 * @version v0.8
 */

FileManagerApp.service('fileUploader', ['$http', '$config', function ($http, $config) {
    var self = this;

    self.requesting = false;
    self.upload = function(fileList, path, success, error) {
        var form = new FormData();

        form.append('destination', '/' + path.join('/'));
        for (var file in fileList) {
            fileObj = fileList[file];
            typeof fileObj === 'object' && form.append('file-' + (1 + parseInt(file)), fileObj);
        }

        self.requesting = true;
        $http.post($config.uploadUrl, form, {
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