/*!
 * Angular FileManager v0.8 (https://github.com/joni2back/angular-filemanager)
 * Jonas Sciangula Street <joni2back@gmail.com>
 * Licensed under MIT (https://github.com/joni2back/angular-filemanager/blob/master/LICENSE)
 */

FileManagerApp.constant("$config", {
    appName: "Angular FileManager",
    listUrl: "/hosting/filemanager/listdirectory",
    uploadUrl: "/hosting/filemanager/upload",
    renameUrl: "/filemgr.php",
    copyUrl: "/filemgr.php",
    deleteUrl: "/filemgr.php",
    editUrl: "/filemgr.php",
    getContentUrl: "/filemgr.php",
    createFolderUrl: "/filemgr.php",
    downloadFileUrl: "/filemgr.php",
    compressUrl: "/filemgr.php",
    extractUrl: "/filemgr.php",

    isEditableFilePattern: '\\.(txt|html|htm|aspx|asp|ini|pl|py|md|php|css|js|log|htaccess|htpasswd|json)$',
    isImageFilePattern: '\\.(jpg|jpeg|gif|bmp|png|svg|tiff)$',
    isExtractableFilePattern: '\\.(zip|gz|tar|rar|gzip)$'
});
