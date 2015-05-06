//(function(angular) {
//    "use strict";
//    angular.module('FileManagerApp').constant("$config", {
//        appName: "https://github.com/joni2back/angular-filemanager",
//        defaultLang: "en",

//        listUrl: "bridges/php/handler.php",
//        uploadUrl: "/hosting/filemanager/upload",

//        renameUrl: "/hosting/filemanager/item/rename",
//        copyUrl: "/hosting/filemanager/item/copy",
//        removeUrl: "/hosting/filemanager/item/remove",
//        editUrl: "/hosting/filemanager/item/edit",
//        getContentUrl: "bridges/php/handler.php",
//        createFolderUrl: "/hosting/filemanager/item/folder/create",
//        downloadFileUrl: "bridges/php/handler.php",
//        compressUrl: "/hosting/filemanager/item/compress",
//        extractUrl: "/hosting/filemanager/item/extract",
//        permissionsUrl: "/hosting/filemanager/item/permissions/set",

//        enablePermissionsModule: true,
//        enablePermissionsRecursive: true,
//        enableCompressChooseName: false,

//        isEditableFilePattern: '\\.(txt|html|htm|aspx|asp|ini|pl|py|md|php|css|js|log|htaccess|htpasswd|json)$',
//        isImageFilePattern: '\\.(jpg|jpeg|gif|bmp|png|svg|tiff)$',
//        isExtractableFilePattern: '\\.(zip|gz|tar|rar|gzip)$'
//    });
//})(angular);

(function (angular) {
    var server = "http://localhost:5839/api/FileManager";
    "use strict";
    angular.module('FileManagerApp').constant("$config", {
        
        appName: "https://github.com/joni2back/angular-filemanager",
        defaultLang: "en",

        listUrl: server,
        uploadUrl: server,

        renameUrl: server,
        copyUrl: server,
        removeUrl: server,
        editUrl: server,
        getContentUrl: server,
        createFolderUrl: server,
        downloadFileUrl: server,
        compressUrl: server,
        extractUrl: server,
        permissionsUrl: server,

        enablePermissionsModule: true,
        enablePermissionsRecursive: true,
        enableCompressChooseName: false,

        isEditableFilePattern: '\\.(txt|html|htm|aspx|asp|ini|pl|py|md|php|css|js|log|htaccess|htpasswd|json)$',
        isImageFilePattern: '\\.(jpg|jpeg|gif|bmp|png|svg|tiff)$',
        isExtractableFilePattern: '\\.(zip|gz|tar|rar|gzip)$'
    });
})(angular);