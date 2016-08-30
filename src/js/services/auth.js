(function(angular) {
    'use strict';
    angular.module('FileManagerApp')
        .factory('AuthInterceptor', ['$q', 'Auth', function ($q, Auth) {
            return {
                responseError: function(rejection){
                    if(rejection.status == 401){
                        Auth.setStatus(false);
                    }

                    return $q.reject(rejection);
                }
            };
        }])
        .service('Auth', function () {
            var data = {
                status: false
            };

            return {
                getStatus: function(){ return data.status; },
                setStatus: function(isActive){ data.status = isActive; }
            };
        });
})(angular);