var jsonData = [
	{
		name: 'archivo.tar.gz',
		type: 'file',
        date: new Date(),
        size: 289329
	},
	{
		name: 'ejecutable.exe',
		type: 'file',
        date: new Date(),
        size: 34539
	},
	{
		name: 'includes',
		type: 'dir',
        date: new Date(),
        size: 4
	},
	{
		name: 'dsc-39289843.jpg',
		type: 'file',
        date: new Date(),
        size: 3499
	},
	{
		name: 'assets',
		type: 'dir',
        date: new Date(),
        size: 4
	},
	{
		name: 'zorro',
		type: 'dir',
        date: new Date(),
        size: 4
	}
];

var fileManager = angular.module('fileManagerApp', []);

fileManager.controller('FileManagerCtrl', function ($scope) {
	$scope.fileList = jsonData;
	$scope.orderProp = ['type', 'name'];
    $scope.temp = {};

    $scope.touch = function(item) {
        $scope.temp = item || {};
    };

    $scope.delete = function(item) {
        var id = $scope.fileList.indexOf(item);
        $scope.fileList.splice(id, 1);
        $('#delete').modal('hide');
    };

    $scope.rename = function(item) {
        var newName = window.prompt('New filename?', item.name);
        item.name = newName || item.name;
        $('#rename').modal('hide');
    };

    $scope.copy = function(item) {
        var newItem = angular.copy(item);
        while ($scope.fileNameExists(newItem.name)) {
            newItem.name += '_copy';
        }
        $scope.fileList.push(newItem);
        $('#copy').modal('hide');
    };

    $scope.fileNameExists = function(fileName) {
        for (item in $scope.fileList) {
            item = $scope.fileList[item];
            if (item.name === fileName) {
                return true;
            }
        }
    };
});
