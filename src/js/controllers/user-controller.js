(function(angular) {
    'use strict';

    angular.module('FileManagerApp').controller('UserController', ['$scope', '$http', 'apiMiddleware', 'Auth', 'fileManagerConfig', 'fileNavigator', function ($scope, $http, apiMiddleware, Auth, fileManagerConfig, fileNavigator) {
        var vm = this;

        apiMiddleware = new apiMiddleware();
        fileNavigator = new fileNavigator();

        vm.config = fileManagerConfig;
        vm.status = Auth.getStatus();
        vm.loading = 1;
        vm.login = {
            attempt: loginAttempt,
            error: false,
            input: {
                username: '',
                password: ''
            }
        };

        fileNavigator.list().then(function () {
            Auth.setStatus(true);
        },function(){
            Auth.setStatus(false);
        }).finally(function(){
            vm.loading--;
        });

        $scope.$watch(function(){
            return Auth.getStatus();
        },function(newValue){
            if(false === newValue){
                vm.status = false;
            }

            if(true == newValue){
                vm.status = true;
            }
        });

        function loginAttempt(){
            vm.login.error = false;
            vm.loading++;
            apiMiddleware.login(vm.login.input).then(function(){
                Auth.setStatus(true);
            }, function(){
                vm.login.error = true;
                Auth.setStatus(false);
            }).finally(function(){
                vm.loading--;
            });
        }
    }]);

})(angular);