/*!
 * Angular FileManager v0.8 (https://github.com/joni2back/angular-filemanager)
 * Jonas Sciangula Street <joni2back@gmail.com>
 * Licensed under MIT (https://github.com/joni2back/angular-filemanager/blob/master/LICENSE)
 */

FileManagerApp.service('fileNavigator', ['$http', '$config', 'item', function ($http, $config, Item) {

    $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

    var FileNavigator = function() {
        this.requesting = false;
        this.fileList = [];
        this.currentPath = [];
        this.history = [];
        this.error = '';
    };

    FileNavigator.prototype.refresh = function(success, error) {
        var self = this;
        var path = self.currentPath.join('/');
        var data = {params: {
            mode: "list",
            onlyFolders: false,
            path: '/' + path
        }};

        self.requesting = true;
        self.fileList = [];
        self.error = '';
        $http.post($config.listUrl, data).success(function(data) {
            self.fileList = [];
            angular.forEach(data.result, function(file) {
                self.fileList.push(new Item(file, self.currentPath));
            });
            self.requesting = false;
            self.buildTree(path);

            if (data.error) {
                self.error = data.error;
                return typeof error === 'function' && error(data);
            }
            typeof success === 'function' && success(data);
        }).error(function(data) {
            self.requesting = false;
            typeof error === 'function' && error(data);
        });
    };

    FileNavigator.prototype.buildTree = function(path) {
        var self = this;
        var recursive = function(parent, file, path) {
            var absName = path ? (path + '/' + file.name) : file.name;
            if (parent.name && !path.match(new RegExp('^' + parent.name))) {
                parent.nodes = [];
            }
            if (parent.name !== path) {
                for (var i in parent.nodes) {
                    recursive(parent.nodes[i], file, path);
                }
            } else {
                for (var i in parent.nodes) {
                    if (parent.nodes[i].name === absName) {
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

    FileNavigator.prototype.listHasFolders = function() {
        var self = this;
        for (var item in self.fileList) {
            if (self.fileList[item].model.type === 'dir') {
                return true;
            }
        }
    };

    return FileNavigator;
}]);
