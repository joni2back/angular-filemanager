(function(angular) {
    'use strict';
    angular.module('FileManagerApp').provider('fileManagerConfig', function() {

        var values = {
            appName: 'angular-filemanager v2',
            defaultLang: 'en',

            listUrl: 'bridges/php/v2/handler.php',
            uploadUrl: 'bridges/php/v2/handler.php',
            renameUrl: 'bridges/php/v2/handler.php',
            copyUrl: 'bridges/php/v2/handler.php',
            moveUrl: 'bridges/php/v2/handler.php',
            removeUrl: 'bridges/php/v2/handler.php',
            editUrl: 'bridges/php/v2/handler.php',
            getContentUrl: 'bridges/php/v2/handler.php',
            createFolderUrl: 'bridges/php/v2/handler.php',
            downloadFileUrl: 'bridges/php/v2/handler.php',
            downloadMultipleUrl: 'bridges/php/v2/handler.php',
            compressUrl: 'bridges/php/v2/handler.php',
            extractUrl: 'bridges/php/v2/handler.php',
            permissionsUrl: 'bridges/php/v2/handler.php',

            searchForm: true,
            sidebar: true,
            breadcrumb: true,
            allowedActions: {
                upload: true,
                rename: true,
                move: true,
                copy: true,
                edit: true,
                changePermissions: true,
                compress: true,
                compressChooseName: true,
                extract: true,
                download: true,
                downloadMultiple: true,
                preview: true,
                remove: true
            },

            multipleDownloadFileName: 'angular-filemanager.zip',
            showSizeForDirectories: false,
            useBinarySizePrefixes: false,
            downloadFilesByAjax: true,
            previewImagesInModal: true,
            enablePermissionsRecursive: true,
            compressAsync: false,
            extractAsync: false,

            isEditableFilePattern: /\.(txt|diff?|patch|svg|asc|cnf|cfg|conf|html?|.html|cfm|cgi|aspx?|ini|pl|py|md|css|cs|js|jsp|log|htaccess|htpasswd|gitignore|gitattributes|env|json|atom|eml|rss|markdown|sql|xml|xslt?|sh|rb|as|bat|cmd|cob|for|ftn|frm|frx|inc|lisp|scm|coffee|php[3-6]?|java|c|cbl|go|h|scala|vb|tmpl|lock|go|yml|yaml|tsv|lst)$/i,
            isImageFilePattern: /\.(jpe?g|gif|bmp|png|svg|tiff?)$/i,
            isExtractableFilePattern: /\.(gz|tar|rar|g?zip)$/i,
            tplPath: 'src/templates'
        };

        return {
            $get: function() {
                return values;
            },
            set: function (constants) {
                angular.extend(values, constants);
            }
        };

    });
})(angular);
