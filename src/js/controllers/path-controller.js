(function (angular) {

    'use strict';
    angular.module('FileManagerApp').controller('PathCtrl', [
        '$scope', 'filePathSetter',
        function ($scope, filePathSetter) {

            $scope.setInitPath = function (path) {
                filePathSetter.setInitPath(path);
            };

        }]);
})(angular);
