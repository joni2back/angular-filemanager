FileManagerApp.factory('item', function() {

    var Item = function(model) {

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
        if (this.tempModel.name.trim()) {
            this.update();
            $('#rename').modal('hide');
        }
    };

    Item.prototype.edit = function() {
        //this.model.content = this.tempModel.content;
        this.update();
        $('#edit').modal('hide');
    };

    Item.prototype.isFolder = function() {
        return this.model.type === 'dir';
    };

    Item.prototype.isEditable = function() {
        return !!this.model.name.match('\.txt$');
    };

    Item.prototype.isCompressible = function() {
        return this.isFolder();
    };

    Item.prototype.isExtractable = function() {
        return !!(!this.isFolder() && this.model.name.match('\.(zip|gz|tar|rar|gzip)$'));
    };

    return Item;
});