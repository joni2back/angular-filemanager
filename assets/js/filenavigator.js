(function (angular) {
    "use strict";
    angular.module('FileManagerApp').service('fileNavigator', [
        '$http', '$config', 'item', function ($http, $config, Item) {

            $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

            var FileNavigator = function () {
                this.requesting = false;
                this.fileList = [];
                this.currentPath = [];
                this.history = [];
                this.error = '';
                this.TargetNodeParent = '/';
                this.TargetNodeName = '/';
                this.Operation = '';
            };

            FileNavigator.prototype.refresh = function (success, error) {
                var self = this;
                var path = self.currentPath.join('/');
                var data = {
                    params: {
                        mode: "list",
                        onlyFolders: false,
                        path: '/' + path
                    }
                };

                self.requesting = true;
                self.fileList = [];
                self.error = '';
                $http.post($config.listUrl, data).success(function (data) {
                    self.fileList = [];
                    angular.forEach(data.result, function (file) {
                        self.fileList.push(new Item(file, self.currentPath));
                    });
                    self.requesting = false;
                    if (FileNavigator.Operation === 'remove') self.treeRemove(path);
                    else if (FileNavigator.Operation === "rename") {
                        self.treeRemove(path);
                        self.treeSet(path);
                        
                    }
                    else self.treeSet(path);

                    if (data.error) {
                        self.error = data.error;
                        return typeof error === 'function' && error(data);
                    }
                    typeof success === 'function' && success(data);
                }).error(function (data) {
                    self.requesting = false;
                    typeof error === 'function' && error(data);
                });
            };

            FileNavigator.prototype.setTarget = function (item, operation) {
                if (operation === "rename") {
                    FileNavigator.Operation = operation;
                    console.log(item);
                    FileNavigator.TargetNodeParent = item.model.path.join('/');
                    FileNavigator.TargetNodeName = item.oldPath.substr(1);
                }
                else if (operation === "remove") {
                    FileNavigator.Operation = operation;
                    FileNavigator.TargetNodeParent = item.model.path.join('/');
                    FileNavigator.TargetNodeName = item.model.path.length > 0 ? FileNavigator.TargetNodeParent + '/' + item.model.name : item.model.name;
                    console.log(FileNavigator.TargetNodeParent, FileNavigator.TargetNodeName);
                }
            }

            FileNavigator.prototype.treeRemove = function (path) {

                var self = this;
                var recursiveX = function (parent, file, path) {

                    var absName = null;
                    if (file != null) absName = path ? (path + '/' + file.name) : file.name;
                    else absName = path
                    for (var i in parent.nodes) {
                        if (parent.nodes[i].name === FileNavigator.TargetNodeName) {
                            parent.nodes.splice(i, 1);
                            break;
                        }
                    }
                    if (parent.name && !path.match(new RegExp('^' + parent.name))) {
                        parent.nodes = [];
                    }
                    if (parent.name !== path) {
                        for (var i in parent.nodes) {
                            if (parent.nodes[i].name === FileNavigator.TargetNodeParent) {
                                for (var j = 0; j < parent.nodes[i].nodes.length; ++j) {
                                    if (parent.nodes[i].nodes[j].name === FileNavigator.TargetNodeName) {
                                        parent.nodes[i].nodes.splice(j, 1);
                                    }
                                }
                            }
                            recursiveX(parent.nodes[i], file, path);
                        }
                    } else {
                        for (var i in parent.nodes) {
                            if (parent.nodes[i].name === FileNavigator.TargetNodeName) {
                                parent.nodes.splice(i, 1);
                                break;
                                //return;
                            }
                        }
                        for (var i in parent.nodes) {
                            if (parent.nodes[i].name === absName) {
                                return;
                            }
                        }
                        if (absName.indexOf('.') === -1) parent.nodes.push({ name: absName, nodes: [] });
                    }
                };
                !self.history.length && self.history.push({ name: path, nodes: [] });
                for (var i in self.fileList) {
                    var file = self.fileList[i].model;
                    if (recursiveX(self.history[0], file, path, file.type === 'dir'));
                }
                if (self.fileList.length === 0) {
                    recursiveX(self.history[0], null, FileNavigator.TargetNodeName, true);
                }
                if ((path === "" && self.fileList.length === 0)) {
                    self.history[0].nodes = [];
                }
            }


            FileNavigator.prototype.treeSet = function (path) {
                var self = this;
                var recursive = function (parent, file, path) {
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
                        parent.nodes.push({ name: absName, nodes: [] });
                    }
                };

                !self.history.length && self.history.push({ name: path, nodes: [] });
                for (var i in self.fileList) {
                    var file = self.fileList[i].model;
                    file.type === 'dir' && recursive(self.history[0], file, path);
                }
            };

            FileNavigator.prototype.folderClickByName = function (fullPath) {
                var self = this;
                fullPath = fullPath.replace(new RegExp("^\/*", "g"), '').split('/');
                self.currentPath = fullPath && fullPath[0] === "" ? [] : fullPath;
                self.refresh();
            };

            FileNavigator.prototype.folderClick = function (item) {
                var self = this;
                if (item && item.model.type === 'dir') {
                    self.currentPath.push(item.model.name);
                    self.refresh();
                }
            };

            FileNavigator.prototype.upDir = function () {
                var self = this;
                if (self.currentPath[0]) {
                    self.currentPath = self.currentPath.slice(0, -1);
                    self.refresh();
                }
            };

            FileNavigator.prototype.goTo = function (index) {
                var self = this;
                self.currentPath = self.currentPath.slice(0, index + 1);
                self.refresh();
            };

            FileNavigator.prototype.fileNameExists = function (fileName) {
                var self = this;
                for (var item in self.fileList) {
                    item = self.fileList[item];
                    if (fileName.trim && item.model.name.trim() === fileName.trim()) {
                        return true;
                    }
                }
            };

            FileNavigator.prototype.listHasFolders = function () {
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