FileManagerApp.service('fileNavigator', ['$http', '$config', 'item', function ($http, $config, Item) {

    var FileNavigator = function() {
        var self = this;

        self.requesting = false;
        self.fileList = [];
        self.currentPath = $config.rootPath;
    };

    FileNavigator.prototype.refresh = function(success, error) {
        var self = this;
        var path = '/' + self.currentPath.join('/');
        var data = {params:{onlyFolders: false, path: path}};
        self.requesting = true;
        self.fileList = [];
        $http.post($config.listUrl, data).success(function(data) {
            self.fileList = [];
            angular.forEach(data.result, function(file) {
                self.fileList.push(new Item(file, self.currentPath));
            });
            self.requesting = false;
            typeof success === 'function' && success(data);
        }).error(function(data) {
            self.requesting = false;
            typeof error === 'function' && error(data);
        });
    };

    FileNavigator.prototype.folderClick = function(item) {
        var self = this;
        if (item && item.model.type === 'dir') {
            self.currentPath.push(item.model.name);
            self.refresh();
        }
    };

    FileNavigator.prototype.upDir = function() {
        var self = this;
        if (self.currentPath[0] && self.currentPath[1]) {
            self.currentPath = self.currentPath.slice(0, -1);
            self.refresh();
        }
    };

    FileNavigator.prototype.goTo = function(index) {
        var self = this;
        self.currentPath = self.currentPath.slice(0, index + 1);
        self.refresh();
    };

    FileNavigator.prototype.fileNameExists = function(fileName) {
        var self = this;
        for (var item in self.fileList) {
            item = self.fileList[item];
            if (fileName.trim && item.model.name.trim() === fileName.trim()) {
                return true;
            }
        }
    };

    return FileNavigator;
}]);