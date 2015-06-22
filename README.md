## angular-filemanager
File manager developed with AngularJS and Bootstrap by [Jonas Sciangula Street](https://github.com/joni2back)

### use in your project

#### 1) install and use
1) bower install --save angular-filemanager
2) include the dependencies in your project:

    <!-- third party -->
    <script src="/bower_components/angular-translate/angular-translate.min.js"></script>
    <script src="/bower_components/angular-cookies/angular-cookies.min.js"></script>
    
    <!-- angular-filemanager -->
    <link rel="stylesheet" href="/bower_components/angular-filemanager/dist/angular-filemanager.css">
    <script src="/bower_components/angular-filemanager/dist/angular-filemanager.min.js"></script>
    <script src="/bower_components/angular-filemanager/dist/cached-templates.js"></script>
3) use the angular directive in your HTML:
    <angular-file-manager></angular-file-manager>
    
#### 2) configure

To configure the file manager you can simply add a config to your `config.js`:

    angular.module('yourApp')
      .config(function() {
        // ...
      });
    
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
    
      enablePermissionsModule: true,
      enablePermissionsRecursive: true,
      enableCompressChooseName: false,
    
      isEditableFilePattern: '\\.(txt|html|htm|aspx|asp|ini|pl|py|md|php|css|js|log|htaccess|htpasswd|json|sql|xml|xslt|sh|rb|as|bat|cmd|coffee|php[3-6]|java|c|cbl|go|h|scala|vb)$',
      isImageFilePattern: '\\.(jpg|jpeg|gif|bmp|png|svg|tiff)$',
      isExtractableFilePattern: '\\.(zip|gz|tar|rar|gzip)$'
    });

#### [Try the DEMO (only listing and file editor)](http://zendelsolutions.com/zendel/projects/angular-filemanager)
---------
![alt tag](https://raw.githubusercontent.com/joni2back/angular-filemanager/master/angular-filemanager.png)
![alt tag](https://raw.githubusercontent.com/joni2back/angular-filemanager/master/angular-filemanager-mobile.png) Mobile support

### Features
  - Multilanguage (English / Spanish / Portuguese)
  - Multiple templates (List / Icons)
  - Multiple file upload
  - Search files
  - Directory tree navigation
  - Copy, Move, Rename (Interactive UX)
  - Delete, Edit, Preview, Download
  - File permissions (Unix chmod style)

### TODO
  - Multiple file selector
  - Dropbox and Google Drive compatibility
  - Backend bridges (PHP, Java, Python, Node, .Net)

--------------------
### Backend API

#### Listing
    URL: $config.listUrl, Method: POST
##### JSON Request content
```json
{ "params": {
    "mode": "list",
    "onlyFolders": false,
    "path": "/public_html"
}}
```
##### JSON Response
```json
{ "result": [ 
    {
        "name": "joomla",
        "rights": "drwxr-xr-x",
        "size": "4096",
        "date": "2015-04-29 09:04:24",
        "type": "dir"
    }, {
        "name": "magento",
        "rights": "drwxr-xr-x",
        "size": "4096",
        "date": "17:42",
        "type": "dir"
    }, {
        "name": "index.php",
        "rights": "-rw-r--r--",
        "size": "0",
        "date": "2013-11-01 11:44:13",
        "type": "file"
    }
]}
```

--------------------

#### Rename / Move
    URL: $config.renameUrl, Method: POST
##### JSON Request content
```json
{ "params": {
    "mode": "rename",
    "path": "/public_html/index.php",
    "newPath": "/public_html/index2.php"
}}
```
##### JSON Response
```json
{ "result": { "success": true, "error": null } }
```

--------------------

#### Copy
    URL: $config.copyUrl, Method: POST
##### JSON Request content
```json
{ "params": {
    "mode": "copy",
    "path": "/public_html/index.php",
    "newPath": "/public_html/index-copy.php"
}}
```
##### JSON Response
```json
{ "result": { "success": true, "error": null } }
```

--------------------

#### Remove
    URL: $config.removeUrl, Method: POST
##### JSON Request content
```json
{ "params": {
    "mode": "delete",
    "path": "/public_html/index.php",
}}
```
##### JSON Response
```json
{ "result": { "success": true, "error": null } }
```

--------------------

#### Edit file
    URL: $config.editUrl, Method: POST

##### JSON Request content
```json
{ "params": {
    "mode": "savefile",
    "content": "<?php echo random(); ?>",
    "path": "/public_html/index.php",
}}
```

##### JSON Response
```json
{ "result": { "success": true, "error": null } }
```

--------------------

#### Get content of a file
    URL: $config.getContentUrl, Method: POST
##### JSON Request content
```json
{ "params": {
    "mode": "editfile",
    "path": "/public_html/index.php"
}}
```
##### JSON Response
```json
{ "result": "<?php echo random(); ?>" }
```

--------------------

#### Create folder
    URL: $config.createFolderUrl, Method: POST

##### JSON Request content
```json
{ "params": {
    "mode": "addfolder",
    "name": "new-folder",
    "path": "/public_html"
}}
```
##### JSON Response
```json
{ "result": { "success": true, "error": null } }
```

--------------------

#### Set permissions
    URL: $config.permissionsUrl, Method: POST

##### JSON Request content
```json
{ "params": {
    "mode": "changepermissions",
    "path": "/public_html/index.php",
    "perms": "653",
    "permsCode": "rw-r-x-wx",
    "recursive": false
}}
```
##### JSON Response
```json
{ "result": { "success": true, "error": null } }
```

--------------------

#### Compress file
    URL: $config.compressUrl, Method: POST
##### JSON Request content
```json
{ "params": {
    "mode": "compress",
    "path": "/public_html/compressed.zip",
    "destination": "/public_html/backups"
}}
```
##### JSON Response
```json
{ "result": { "success": true, "error": null } }
```

--------------------

#### Extract file
    URL: $config.extractUrl, Method: POST
##### JSON Request content
```json
{ "params": {
    "mode": "extract",
    "destination": "/public_html/extracted-files",
    "path": "/public_html/compressed.zip",
    "sourceFile": "/public_html/compressed.zip"
}}
```
##### JSON Response
```json
{ "result": { "success": true, "error": null } }
```

--------------------

#### Upload file
    URL: $config.uploadUrl, Method: POST, Content-Type: multipart/form-data
    Unlimited file upload, each item will be enumerated as file-1, file-2, etc.
##### Http post params
```
[$config.uploadUrl]?destination=/public_html/image.jpg&file-1={..}&file-2={...}
```
##### JSON Response
```json
{ "result": { "success": true, "error": null } }
```

--------------------

#### Download / Preview file
    URL: $config.downloadFileUrl, Method: GET

##### Http query params
```
[$config.downloadFileUrl]?mode=download&preview=true&path=/public_html/image.jpg
```
##### Response
```
-File content
```
--------------------

##### Errors / Exceptions
Any backend error should be with an error 500 HTTP code.
Btw, you can also report errors with a 200 response using this json structure
```json
{ "result": {
    "success": false,
    "error": "Access denied to remove file"
}}
```
--------------------

### Contribute
To contribute to the project you can simply fork this repo. To build a minified version, you can simply run the Gulp 
task `gulp build`. The minified/uglified files are created in the `dist` folder.

### Versioning
For transparency into our release cycle and in striving to maintain backward compatibility, angular-filemanager is 
maintained under [the Semantic Versioning guidelines](http://semver.org/).

### Copyright and license
Code and documentation released under [the MIT license](https://github.com/joni2back/angular-filemanager/blob/master/LICENSE). 
