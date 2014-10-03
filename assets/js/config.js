FileManagerApp.service('$config', function () {
    return {
        rootPath: ['public_html'],
        listUrl: 'files.json',
        listUrl: '/hosting/filemanager/customlist',
        uploadUrl: '/hosting/filemanager/upload',
        renameUrl: '/connector',
        copyUrl: '/connector',
        deleteUrl: '/connector',
        editUrl: '/connector',
        getContentUrl: '/connector',
        createFileUrl: '/connector',
        createFolderUrl: '/connector',
        copyFileSuffix: '_copy'
    };
});