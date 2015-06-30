(function(angular) {
    "use strict";
    angular.module('FileManagerApp').service('fileNavigator', [
        '$http', 'fileManagerConfig', 'item', function ($http, fileManagerConfig, Item) {

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
            $http.post(fileManagerConfig.listUrl, data).success(function(data) {
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
            function recursive(parent, file, path) {
                var absName = path ? (path + '/' + file.name) : file.name;
                if (parent.name.trim() && path.trim().indexOf(parent.name) !== 0) {
                    parent.nodes = [];
                }
                if (parent.name !== path) {
                    for (var i in parent.nodes) {
                        recursive(parent.nodes[i], file, path);
                    }
                } else {
                    for (var e in parent.nodes) {
                        if (parent.nodes[e].name === absName) {
                            return;
                        }
                    }
                    parent.nodes.push({name: absName, nodes: []});
                }
                parent.nodes = parent.nodes.sort(function(a, b) {
                    return a.name < b.name ? -1 : a.name === b.name ? 0 : 1;
                });
            };

            !self.history.length && self.history.push({name: path, nodes: []});
            for (var o in self.fileList) {
                var item = self.fileList[o];
                item.isFolder() && recursive(self.history[0], item.model, path);
            }
        };

        FileNavigator.prototype.folderClickByName = function(fullPath) {
            var self = this;
            fullPath = fullPath.replace(RegExp("^\/*", "g"), '').split('/');
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
})(angular);