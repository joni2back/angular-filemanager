## angular-filemanager
File manager developed with AngularJS and Bootstrap by [Jonas Sciangula Street](https://github.com/joni2back)

#### [Try the DEMO (only listing and file editor)](http://zendelsolutions.com/zendel/projects/angular-filemanager)
---------
![alt tag](https://raw.githubusercontent.com/joni2back/angular-filemanager/master/angular-filemanager.png)
![alt tag](https://raw.githubusercontent.com/joni2back/angular-filemanager/master/angular-filemanager-mobile.png)  Mobile support

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

### Versioning
For transparency into our release cycle and in striving to maintain backward compatibility, angular-filemanager is maintained under [the Semantic Versioning guidelines](http://semver.org/).

### Copyright and license
Code and documentation released under [the MIT license](https://github.com/joni2back/angular-filemanager/blob/master/LICENSE). 


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/joni2back/angular-filemanager/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

