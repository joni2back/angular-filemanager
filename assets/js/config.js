FileManagerApp && FileManagerApp.constant("$config", {
    rootPath: ["public_html"],
    appName: "AngularJS FileManager",
    listUrl: "files.json",
    uploadUrl: "/proxy.py",
    renameUrl: "/proxy.py",
    copyUrl: "/proxy.py",
    deleteUrl: "/proxy.py",
    editUrl: "/proxy.py",
    getContentUrl: "/proxy.py",
    createFileUrl: "/proxy.py",
    createFolderUrl: "/proxy.py",

    msg: {
        invalidFilename: "Invalid filename or already exists, specify another name",
        errorModifying: "An error occurred modifying the file",
        errorDeleting: "An error occurred deleting the file or folder",
        errorRenaming: "An error occurred renaming the file",
        errorGettingContent: "An error occurred getting the content of the file"
    }
});