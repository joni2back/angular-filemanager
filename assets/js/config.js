(function(angular) {
    "use strict";
    angular.module('FileManagerApp').constant("fileManagerConfig", {
        appName: "https://github.com/joni2back/angular-filemanager",
        defaultLang: "en",

        listUrl: "bridges/php/handler.php",
        uploadUrl: "bridges/php/handler.php",
        renameUrl: "bridges/php/handler.php",
        copyUrl: "bridges/php/handler.php",
        removeUrl: "bridges/php/handler.php",
        editUrl: "bridges/php/handler.php",
        getContentUrl: "bridges/php/handler.php",
        createFolderUrl: "bridges/php/handler.php",
        downloadFileUrl: "bridges/php/handler.php",
        compressUrl: "bridges/php/handler.php",
        extractUrl: "bridges/php/handler.php",
        permissionsUrl: "bridges/php/handler.php",

        allowedActions: {
            rename: true,
            copy: true,
            edit: true,
            changePermissions: true,
            compress: true,
            compressChooseName: true,
            extract: true,
            download: true,
            preview: true,
            remove: true
        },

        enablePermissionsRecursive: true,

        isEditableFilePattern: '\\.(txt|html|htm|aspx|asp|ini|pl|py|md|php|css|js|log|htaccess|htpasswd|json|sql|xml|xslt|sh|rb|as|bat|cmd|coffee|php[3-6]|java|c|cbl|go|h|scala|vb)$',
        isImageFilePattern: '\\.(jpg|jpeg|gif|bmp|png|svg|tiff)$',
        isExtractableFilePattern: '\\.(zip|gz|tar|rar|gzip)$'
    });
})(angular);
