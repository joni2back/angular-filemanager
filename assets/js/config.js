FileManagerApp.service('$config', function () {
    return {
        rootPath: ['public_html'],
        listUrl: 'files.json',
        //listUrl: '/hosting/filemanager/customlist',
        uploadUrl: '/uploadfilesCfg',
        renameUrl: '',
        copyUrl: '',
        deleteUrl: '',
        createFileUrl: '',
        createFolderUrl: '',
        copyFileSuffix: '_copy'
    };
});