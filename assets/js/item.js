FileManagerApp.factory('item', ['$http', function($http) {

    var Item = function(model) {
        this.inprocess = false;
        var rawModel = {
            name: '',
            type: 'file',
            size: 0,
            date: new Date(),
            content: ''
        };

        this.model = angular.copy(rawModel);
        this.tempModel = angular.copy(rawModel);

        angular.extend(this.model, model);
        angular.extend(this.tempModel, model);

        this.update = function() {
            angular.extend(this.model, this.tempModel);
        };
    };

    Item.prototype.rename = function() {
        var self = this;
        if (this.tempModel.name.trim()) {
            self.inprocess = true;
            $http.post('/fmgr?rename', this.tempModel).success(function(data) {
                self.update();
                $('#rename').modal('hide');
                self.inprocess = false;
            }).error(function(data) {
                self.inprocess = false;
            });
        }
    };

    Item.prototype.edit = function() {
        this.update();
        $('#edit').modal('hide');
    };

    Item.prototype.isFolder = function() {
        return this.model.type === 'dir';
    };

    Item.prototype.isEditable = function() {
        return !!this.model.name.match('\.(txt|html|php|css|js)$');
    };

    Item.prototype.isCompressible = function() {
        return this.isFolder();
    };

    Item.prototype.isExtractable = function() {
        return !!(!this.isFolder() && this.model.name.match('\.(zip|gz|tar|rar|gzip)$'));
    };

    return Item;
}]);