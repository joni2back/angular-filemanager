FileManagerApp.factory('item', ['$http', '$config', 'chmod', function($http, $config, Chmod) {

    var Item = function(model, path) {
        var rawModel = {
            name: '',
            path: path || [],
            type: 'file',
            size: 0,
            date: new Date(),
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

    Item.prototype.rename = function(success, error) {
        var self = this;
        if (self.tempModel.name.trim()) {
            self.inprocess = true;
            self.error = '';
            $http.post($config.renameUrl, self.tempModel).success(function(data) {
                self.update();
                self.inprocess = false;
                typeof success === 'function' && success(data);
            }).error(function(data) {
                self.inprocess = false;
                self.error = $config.msg.errorRenaming;
                typeof error === 'function' && error(data);
            });
        }
        return self;
    };

    Item.prototype.download = function() {
        var self = this;
        var data = {
            mode: "download",
            path: self.model.fullPath()
        };
        var url = [$config.downloadFileUrl, $.param(data)].join('?');
        if (self.model.type !== 'dir') {
            window.open(url, '_blank', '');
        }
        return self;
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

    Item.prototype.edit = function() {
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
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            url: $config.editUrl,
            data: $.param(data)
        }).success(function(data) {
            self.inprocess = false;
            self.update();
            $('#edit').modal('hide');
        }).error(function(data) {
            self.inprocess = false;
            self.error = $config.msg.errorModifying;
        });
        return self;
    };

    Item.prototype.changePermissions = function() {
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
            $('#changepermissions').modal('hide');
        }).error(function(data) {
            self.inprocess = false;
            self.error = $config.msg.errorModifying;
        });
        return self;
    };

    Item.prototype.isFolder = function() {
        return this.model.type === 'dir';
    };

    Item.prototype.isEditable = function() {
        return !!this.model.name.match($config.isEditableFilePattern);
    };

    Item.prototype.isCompressible = function() {
        return this.isFolder();
    };

    Item.prototype.isExtractable = function() {
        return !!(!this.isFolder() && this.model.name.match($config.isExtractableFilePattern));
    };

    return Item;
}]);