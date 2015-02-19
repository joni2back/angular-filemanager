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

    msg: {
        invalidFilename: "Invalid filename or already exists, specify another name",
        errorModifying: "An error occurred modifying the file",
        errorDeleting: "An error occurred deleting the file or folder",
        errorRenaming: "An error occurred renaming the file",
        errorCopying: "An error occurred copying the file",
        errorCompressing: "An error occurred compressing the file or folder",
        errorCreatingFolder: "An error occurred creating the folder",
        errorGettingContent: "An error occurred getting the content of the file"
    },

    isEditableFilePattern: '\\.(txt|html|htm|aspx|asp|ini|pl|py|md|php|css|js|log|htaccess|htpasswd|json)$',
    isImageFilePattern: '\\.(jpg|jpeg|gif|bmp|png|svg|tiff)$',
    isExtractableFilePattern: '\\.(zip|gz|tar|rar|gzip)$'
});