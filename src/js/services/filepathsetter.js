(function (angular) {
    'use strict';
    angular.module('FileManagerApp').service('filePathSetter', function () {

        var initPath = [];

        var setInitPath = function (path) {
            initPath = path;
        };

        var getInitPath = function () {
            return initPath;
        };

        return {
            setInitPath: setInitPath,
            getInitPath: getInitPath
        };
    });
})(angular);
