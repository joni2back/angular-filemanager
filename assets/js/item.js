FileManagerApp.factory('item', ['$http', '$config', 'chmod', function($http, $config, Chmod) {

    var Item = function(model, path) {
        var rawModel = {
            name: '',
            path: path || [],
            type: 'file',
            size: 0,
            date: model && new Date(model.month + ' ' + model.day + ', ' + new Date().getFullYear() + ' ' + model.time + ':00'),
            //date: model && model.day + ' ' + model.month + ' - ' + model.time,
            perms: new Chmod(),
            content: '',
            sizeKb: function() {
                return Math.round(this.size / 1024, 1);
            },
            fullPath: function() {
                return '/' + this.path.join('/') + '/' + this.name;
            }
        };

        this.error = '';
        this.inprocess = false;
        this.model = angular.copy(rawModel);
        this.tempModel = angular.copy(rawModel);

        this.update = function() {
            angular.extend(this.model, angular.copy(this.tempModel));
            return this;
        };

        this.revert = function() {
            angular.extend(this.tempModel, this.model);
            this.error = '';
            return this;
        };

        angular.extend(this.model, model);
        angular.extend(this.tempModel, model);
    };

    Item.prototype.createFolder = function(success, error) {
        var self = this;
        var data = {
            mode: "addfolder",
            path: self.tempModel.path.join('/'),
            name: self.tempModel.name
        };

        if (self.tempModel.name.trim()) {
            self.inprocess = true;
            self.error = '';
            $http({method: 'GET', url: $config.createFolderUrl, params: data}).success(function(data) {
                self.update();
                self.inprocess = false;
                typeof success === 'function' && success(data);
                self.error = data.Error; ///fz
            }).error(function(data) {
                self.inprocess = false;
                self.error = $config.msg.errorCreatingFolder;
                typeof error === 'function' && error(data);
            });
        }
        return self;
    };

    Item.prototype.rename = function(success, error) {
        var self = this;
        var data = {
            mode: "rename",
            old: self.model.fullPath(),
            new: self.tempModel.fullPath()
        };
        if (self.tempModel.name.trim()) {
            self.inprocess = true;
            self.error = '';
            $http({method: 'GET', url: $config.renameUrl, params: data}).success(function(data) {
                self.update();
                self.inprocess = false;
                typeof success === 'function' && success(data);

                self.error = data.Error; ///fz
            }).error(function(data) {
                self.inprocess = false;
                self.error = $config.msg.errorRenaming;
                typeof error === 'function' && error(data);
            });
        }
        return self;
    };

    Item.prototype.copy = function(success, error) {
        var self = this;
        var data = {
            mode: "copy",
            path: self.model.fullPath(),
            newPath: self.model.fullPath().replace(new RegExp(self.model.name + '$'), self.tempModel.name)
        };
        if (self.tempModel.name.trim()) {
            self.inprocess = true;
            self.error = '';
            $http({method: 'GET', url: $config.copyUrl, params: data}).success(function(data) {
                self.update();
                self.inprocess = false;
                typeof success === 'function' && success(data);

                self.error = data.Error; ///fz
            }).error(function(data) {
                self.inprocess = false;
                self.error = $config.msg.errorCopying;
                typeof error === 'function' && error(data);
            });
        }
        return self;
    };

    Item.prototype.download = function(preview) {
        var self = this;
        var data = {
            mode: "download",
            preview: preview,
            path: self.model.fullPath()
        };
        var url = [$config.downloadFileUrl, $.param(data)].join('?');
        if (self.model.type !== 'dir') {
            window.open(url, '_blank', '');
        }
        return self;
    };

    Item.prototype.preview = function() {
        var self = this;
        return self.download(true);
    };

    Item.prototype.getContent = function() {
        var self = this;
        var data = {
            mode: "editfile",
            path: self.tempModel.fullPath()
        };
        self.inprocess = true;
        self.error = '';
        $http({method: 'GET', url: $config.getContentUrl, params: data}).success(function(data) {
            self.tempModel.content = self.model.content = data.Content;
            self.inprocess = false;
        }).error(function(data) {
            self.inprocess = false;
            self.error = $config.msg.errorGettingContent;
        });
        return self;
    };

    Item.prototype.delete = function(success, error) {
        var self = this;
        var data = {
            mode: "delete",
            path: self.tempModel.fullPath()
        };
        self.inprocess = true;
        self.error = '';
        $http({method: 'GET', url: $config.deleteUrl, params: data}).success(function(data) {
            self.inprocess = false;
            typeof success === 'function' && success(data);
        }).error(function(data) {
            self.inprocess = false;
            self.error = $config.msg.errorDeleting;
            typeof error === 'function' && error(data);
        });
        return self;
    };

    Item.prototype.edit = function(success, error) {
        var self = this;
        var data = {
            mode: "savefile",
            content: self.tempModel.content,
            path: self.tempModel.fullPath()
        };
        self.inprocess = true;
        self.error = '';

        $http({
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'text/plain'},
            url: $config.editUrl,
            data: $.param(data)
        }).success(function(data) {
            self.inprocess = false;
            self.update();
            typeof success === 'function' && success(data);
        }).error(function(data) {
            self.inprocess = false;
            self.error = $config.msg.errorModifying;
            typeof error === 'function' && error(data);
        });
        return self;
    };

    Item.prototype.changePermissions = function(success, error) {
        var self = this;
        var data = {
            mode: "changepermissions",
            path: self.tempModel.fullPath(),
            perms: self.tempModel.perms.getNumber()
        };
        self.inprocess = true;
        self.error = '';
        $http({
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: $config.editUrl,
            data: $.param(data)
        }).success(function(data) {
            self.inprocess = false;
            self.update();
            typeof success === 'function' && success(data);
        }).error(function(data) {
            self.inprocess = false;
            self.error = $config.msg.errorModifying;
            typeof error === 'function' && error(data);
        });
        return self;
    };

    Item.prototype.isFolder = function() {
        return this.model.type === 'dir';
    };

    Item.prototype.isEditable = function() {
        return !this.isFolder() && !!this.model.name.toLowerCase().match(new RegExp($config.isEditableFilePattern));
    };

    Item.prototype.isImage = function() {
        return !!this.model.name.toLowerCase().match(new RegExp($config.isImageFilePattern));
    };

    Item.prototype.isCompressible = function() {
        return this.isFolder();
    };

    Item.prototype.isExtractable = function() {
        return !!(!this.isFolder() && this.model.name.match($config.isExtractableFilePattern));
    };

    return Item;
}]);