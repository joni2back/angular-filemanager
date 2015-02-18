FileManagerApp.service('fileNavigator', ['$http', '$config', 'item', function ($http, $config, Item) {

    var FileNavigator = function() {
        var self = this;

        self.requesting = false;
        self.fileList = [];
        self.currentPath = [];
        self.history = [];
    };

    FileNavigator.prototype.refresh = function(success, error) {
        var self = this;
        var path = self.currentPath.join('/');
        var data = {params:{onlyFolders: false, path: '/' + path}};

        self.requesting = true;
        self.fileList = [];
        $http.post($config.listUrl, data).success(function(data) {
            self.fileList = [];
            angular.forEach(data.result, function(file) {
                self.fileList.push(new Item(file, self.currentPath));
            });
            self.requesting = false;
            self.buildTree(path);
            typeof success === 'function' && success(data);
        }).error(function(data) {
            self.requesting = false;
            typeof error === 'function' && error(data);
        });
    };

    FileNavigator.prototype.buildTree = function(path) {
        var self = this;
        var recursive = function(parent, file, path) {
            if (parent.name && !path.match(new RegExp('^' + parent.name))) {
                parent.nodes = [];
            }
            if (parent.name !== path) {
                for (var i in parent.nodes) {
                    var child = parent.nodes[i];
                    recursive(child, file, path);
                }
            } else {
                var absName = path ? (path + '/' + file.name) : file.name;
                for (var i in parent.nodes) {
                    var child = parent.nodes[i];
                    if (child.name === absName) {
                        return;
                    }
                }
                parent.nodes.push({name: absName, nodes: []});
            }
        };

        !self.history.length && self.history.push({name: path, nodes: []});
        for (var i in self.fileList) {
            var file = self.fileList[i].model;
            file.type === 'dir' && recursive(self.history[0], file, path);
        }
    };

    FileNavigator.prototype.folderClickByName = function(fullPath) {
        var self = this;
        fullPath = fullPath.replace(new RegExp(/^\/*/g), '').split('/');
        self.currentPath = fullPath && fullPath[0] === "" ? [] : fullPath;
        self.refresh();
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
        if (self.currentPath[0]) {
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