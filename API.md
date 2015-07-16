## angular-filemanager API docs

#### Listing (URL: fileManagerConfig.listUrl, Method: POST)

**JSON Request content**
```json
{ "params": {
    "mode": "list",
    "onlyFolders": false,
    "path": "/public_html"
}}
```
**JSON Response**
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
        "size": "549923",
        "date": "2013-11-01 11:44:13",
        "type": "file"
    }
]}
```
--------------------
#### Rename / Move (URL: fileManagerConfig.renameUrl, Method: POST)
**JSON Request content**
```json
{ "params": {
    "mode": "rename",
    "path": "/public_html/index.php",
    "newPath": "/public_html/index2.php"
}}
```
**JSON Response**
```json
{ "result": { "success": true, "error": null } }
```
--------------------
#### Copy (URL: fileManagerConfig.copyUrl, Method: POST)
**JSON Request content**
```json
{ "params": {
    "mode": "copy",
    "path": "/public_html/index.php",
    "newPath": "/public_html/index-copy.php"
}}
```
**JSON Response**
```json
{ "result": { "success": true, "error": null } }
```
--------------------
#### Remove (URL: fileManagerConfig.removeUrl, Method: POST)
**JSON Request content**
```json
{ "params": {
    "mode": "delete",
    "path": "/public_html/index.php",
}}
```
**JSON Response**
```json
{ "result": { "success": true, "error": null } }
```
--------------------
#### Edit file (URL: fileManagerConfig.editUrl, Method: POST)
**JSON Request content**
```json
{ "params": {
    "mode": "savefile",
    "content": "<?php echo random(); ?>",
    "path": "/public_html/index.php",
}}
```
**JSON Response**
```json
{ "result": { "success": true, "error": null } }
```
--------------------
#### Get content of a file (URL: fileManagerConfig.getContentUrl, Method: POST)
**JSON Request content**
```json
{ "params": {
    "mode": "editfile",
    "path": "/public_html/index.php"
}}
```
**JSON Response**
```json
{ "result": "<?php echo random(); ?>" }
```
--------------------
#### Create folder (URL: fileManagerConfig.createFolderUrl, Method: POST)
**JSON Request content**
```json
{ "params": {
    "mode": "addfolder",
    "name": "new-folder",
    "path": "/public_html"
}}
```
**JSON Response**
```json
{ "result": { "success": true, "error": null } }
```
--------------------
#### Set permissions (URL: fileManagerConfig.permissionsUrl, Method: POST)
**JSON Request content**
```json
{ "params": {
    "mode": "changepermissions",
    "path": "/public_html/index.php",
    "perms": "653",
    "permsCode": "rw-r-x-wx",
    "recursive": false
}}
```
**JSON Response**
```json
{ "result": { "success": true, "error": null } }
```
--------------------
#### Compress file (URL: fileManagerConfig.compressUrl, Method: POST)
**JSON Request content**
```json
{ "params": {
    "mode": "compress",
    "path": "/public_html/compressed.zip",
    "destination": "/public_html/backups"
}}
```
**JSON Response**
```json
{ "result": { "success": true, "error": null } }
```
--------------------
#### Extract file (URL: fileManagerConfig.extractUrl, Method: POST)
**JSON Request content**
```json
{ "params": {
    "mode": "extract",
    "destination": "/public_html/extracted-files",
    "path": "/public_html/compressed.zip",
    "sourceFile": "/public_html/compressed.zip"
}}
```
**JSON Response**
```json
{ "result": { "success": true, "error": null } }
```
--------------------
#### Upload file (URL: fileManagerConfig.uploadUrl, Method: POST, Content-Type: multipart/form-data)

**Http post request payload**
```
------WebKitFormBoundaryqBnbHc6RKfXVAf9j
Content-Disposition: form-data; name="destination"
/

------WebKitFormBoundaryqBnbHc6RKfXVAf9j
Content-Disposition: form-data; name="file-0"; filename="github.txt"
Content-Type: text/plain
```
**JSON Response**
```json
{ "result": { "success": true, "error": null } }
```

Unlimited file items to upload, each item will be enumerated as file-0, file-1, etc.

For example, you may retrieve the file in PHP using:
```php
$destination = $_POST['destination'];
$_FILES['file-0'] or foreach($_FILES)
```
--------------------
#### Download / Preview file (URL: fileManagerConfig.downloadFileUrl, Method: GET)
**Http query params**
```
[fileManagerConfig.downloadFileUrl]?mode=download&preview=true&path=/public_html/image.jpg
```
**Response**
```
-File content
```
--------------------
##### Errors / Exceptions
Any backend error should be with an error 500 HTTP code.

Btw, you can also report errors with a 200 response both using this json structure
```json
{ "result": {
    "success": false,
    "error": "Access denied to remove file"
}}
```