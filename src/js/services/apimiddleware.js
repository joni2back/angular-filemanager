(function(angular) {
    'use strict';
    angular.module('FileManagerApp').service('apiMiddleware', ['$window', 'fileManagerConfig', 'apiHandler', 
        function ($window, fileManagerConfig, ApiHandler) {

        var ApiMiddleware = function(config) {
            this.config = (typeof config === 'undefined') ? fileManagerConfig : config;
            this.apiHandler = new ApiHandler();
        };

        ApiMiddleware.prototype.getPath = function(arrayPath) {
            return '/' + arrayPath.join('/');
        };

        ApiMiddleware.prototype.getFileList = function(files) {
            return (files || []).map(function(file) {
                return file && file.model.fullPath();
            });
        };

        ApiMiddleware.prototype.getFilePath = function(item) {
            return item && item.model.fullPath();
        };

        ApiMiddleware.prototype.list = function(path, customDeferredHandler) {
            return this.apiHandler.list(this.config.listUrl, this.getPath(path), customDeferredHandler);
        };

        ApiMiddleware.prototype.copy = function(files, path) {
            var items = this.getFileList(files);
            var singleFilename = items.length === 1 ? files[0].tempModel.name : undefined;
            return this.apiHandler.copy(this.config.copyUrl, items, this.getPath(path), singleFilename);
        };

        ApiMiddleware.prototype.move = function(files, path) {
            var items = this.getFileList(files);
            return this.apiHandler.move(this.config.moveUrl, items, this.getPath(path));
        };

        ApiMiddleware.prototype.remove = function(files) {
            var items = this.getFileList(files);
            return this.apiHandler.remove(this.config.removeUrl, items);
        };

        ApiMiddleware.prototype.upload = function(files, path) {
            if (! $window.FormData) {
                throw new Error('Unsupported browser version');
            }

            var destination = this.getPath(path);

            return this.apiHandler.upload(this.config.uploadUrl, destination, files);
        };

        ApiMiddleware.prototype.getContent = function(item) {
            var itemPath = this.getFilePath(item);
            return this.apiHandler.getContent(this.config.getContentUrl, itemPath);
        };

        ApiMiddleware.prototype.edit = function(item) {
            var itemPath = this.getFilePath(item);
            return this.apiHandler.edit(this.config.editUrl, itemPath, item.tempModel.content);
        };

        ApiMiddleware.prototype.rename = function(item) {
            var itemPath = this.getFilePath(item);
            var newPath = item.tempModel.fullPath();

            return this.apiHandler.rename(this.config.renameUrl, itemPath, newPath);
        };

        ApiMiddleware.prototype.getUrl = function(item) {
            var itemPath = this.getFilePath(item);
            return this.apiHandler.getUrl(this.config.downloadFileUrl, itemPath);
        };

        ApiMiddleware.prototype.download = function(item, forceNewWindow) {
            //TODO: add spinner to indicate file is downloading
            var itemPath = this.getFilePath(item);
            var toFilename = item.model.name;

            if (item.isFolder()) {
                return;
            }
            
            return this.apiHandler.download(
                this.config.downloadFileUrl,
                itemPath,
                toFilename,
                this.config.downloadFilesByAjax,
                forceNewWindow
            );
        };

        ApiMiddleware.prototype.downloadMultiple = function(files, forceNewWindow) {
            var items = this.getFileList(files);
            var timestamp = new Date().getTime().toString().substr(8, 13);
            var toFilename = timestamp + '-' + this.config.multipleDownloadFileName;
            
            return this.apiHandler.downloadMultiple(
                this.config.downloadMultipleUrl,
                items, 
                toFilename, 
                this.config.downloadFilesByAjax,
                forceNewWindow
            );
        };

        ApiMiddleware.prototype.compress = function(files, compressedFilename, path) {
            var items = this.getFileList(files);
            return this.apiHandler.compress(this.config.compressUrl, items, compressedFilename, this.getPath(path));
        };

        ApiMiddleware.prototype.extract = function(item, folderName, path) {
            var itemPath = this.getFilePath(item);
            return this.apiHandler.extract(this.config.extractUrl, itemPath, folderName, this.getPath(path));
        };

        ApiMiddleware.prototype.changePermissions = function(files, dataItem) {
            var items = this.getFileList(files);
            var code = dataItem.tempModel.perms.toCode();
            var octal = dataItem.tempModel.perms.toOctal();
            var recursive = !!dataItem.tempModel.recursive;

            return this.apiHandler.changePermissions(this.config.permissionsUrl, items, code, octal, recursive);
        };

        ApiMiddleware.prototype.createFolder = function(item) {
            var path = item.tempModel.fullPath();
            return this.apiHandler.createFolder(this.config.createFolderUrl, path);
        };

        return ApiMiddleware;

    }]);
})(angular);