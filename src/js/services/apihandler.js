(function(window, angular) {
    'use strict';
    angular.module('FileManagerApp').service('apiHandler', ['$http', '$q', 'fileManagerConfig', function ($http, $q, fileManagerConfig) {

        this.copy = function(files, to) {
            
            window.console.info(files, to);

            var none = [$http, $q, fileManagerConfig];
            window.console.warning = none;
            return {then:function(){}};
        };

    }]);
})(window, angular);