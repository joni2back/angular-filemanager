FileManagerApp.controller('FileManagerCtrl', ['$scope', '$http', 'item', function($scope, $http, Item) {

    $scope.orderProp = ['model.type', 'model.name'];
    $scope.requesting = false;
    $scope.fileList = [];
    $scope.temp = new Item();

    $scope.refresh = function(success, error) {
        $scope.requesting = true;
        $http.get('files.json').success(function(data) {
            angular.forEach(data.files, function(file) {
                $scope.fileList.push(new Item(file));
            });
            $scope.currentPath = data.path;
            $scope.requesting = false;
            typeof success === 'function' && success(data);

        }).error(function(data) {
            $scope.requesting = false;
            typeof error === 'function' && error(data);
        });
    };

    $scope.touch = function(item) {
        $scope.temp = item;
    };

    $scope.copy = function(item) {
        var newItem = angular.copy(item);
        while ($scope.fileNameExists(newItem.model.name)) {
            console.log('existe');
            newItem.model.name += '_copy';
        }
        $scope.fileList.push(newItem);
        $('#copy').modal('hide');
    };

    $scope.delete = function(item) {
        var id = $scope.fileList.indexOf(item);
        $scope.fileList.splice(id, 1);
        $('#delete').modal('hide');
    };

    $scope.createFolder = function(name) {
        name = name.trim();
        if (name && !$scope.fileNameExists(name)) {
            var item = new Item({name: name, type: 'dir'});
            $scope.fileList.push(item);
        }
        $('#newfolder').modal('hide');
    };

    $scope.fileNameExists = function(fileName) {
        for (var item in $scope.fileList) {
            item = $scope.fileList[item];
            if (item.model.name === fileName) {
                return true;
            }
        }
    };

    $scope.refresh();
}]);