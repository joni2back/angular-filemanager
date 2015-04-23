;(function() {
    angular.module('FileManagerApp').constant("$config", {
        appName: "https://github.com/joni2back/angular-filemanager",
        defaultLang: "en",

        listUrl: "bridges/php/handler.php",
        uploadUrl: "/hosting/filemanager/upload",

        renameUrl: "/hosting/filemanager/item/rename",
        copyUrl: "/hosting/filemanager/item/copy",
        removeUrl: "/hosting/filemanager/item/remove",
        editUrl: "/hosting/filemanager/item/edit",
        getContentUrl: "bridges/php/handler.php",
        createFolderUrl: "/hosting/filemanager/item/folder/create",
        downloadFileUrl: "/hosting/filemanager/item/download",
        compressUrl: "/hosting/filemanager/item/compress",
        extractUrl: "/hosting/filemanager/item/extract",
        permissionsUrl: "/hosting/filemanager/item/permissions/set",

        enablePermissionsModule: true,
        enableCompressChooseName: false,

        isEditableFilePattern: '\\.(txt|html|htm|aspx|asp|ini|pl|py|md|php|css|js|log|htaccess|htpasswd|json)$',
        isImageFilePattern: '\\.(jpg|jpeg|gif|bmp|png|svg|tiff)$',
        isExtractableFilePattern: '\\.(zip|gz|tar|rar|gzip)$'
    });
})();