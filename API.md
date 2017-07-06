## angular-filemanager API docs [multiple file support]

#### Listing (URL: fileManagerConfig.listUrl, Method: POST)

**JSON Request content**
```json
{
    "action": "list",
    "path": "/public_html"
}
```
**JSON Response**
```json
{ "result": [ 
    {
        "name": "magento",
        "rights": "drwxr-xr-x",
        "size": "4096",
        "date": "2016-03-03 15:31:40",
        "type": "dir"
    }, {
        "name": "index.php",
        "rights": "-rw-r--r--",
        "size": "549923",
        "date": "2016-03-03 15:31:40",
        "type": "file"
    }
]}
```
--------------------
#### Rename (URL: fileManagerConfig.renameUrl, Method: POST)
**JSON Request content**
```json
{
    "action": "rename",
    "item": "/public_html/index.php",
    "newItemPath": "/public_html/index2.php"
}
```
**JSON Response**
```json
{ "result": { "success": true, "error": null } }
```
--------------------
#### Move (URL: fileManagerConfig.moveUrl, Method: POST)
**JSON Request content**
```json
{
    "action": "move",
    "items": ["/public_html/libs", "/public_html/config.php"],
    "newPath": "/public_html/includes"
}
```
**JSON Response**
```json
{ "result": { "success": true, "error": null } }
```
--------------------
#### Copy (URL: fileManagerConfig.copyUrl, Method: POST)
**JSON Request content**
```json
{
    "action": "copy",
    "items": ["/public_html/index.php", "/public_html/config.php"],
    "newPath": "/includes",
    "singleFilename": "renamed.php" <-- (only present in single selection copy)
}
```
**JSON Response**
```json
{ "result": { "success": true, "error": null } }
```
--------------------
#### Remove (URL: fileManagerConfig.removeUrl, Method: POST)
**JSON Request content**
```json
{
    "action": "remove",
    "items": ["/public_html/index.php"],
}
```
**JSON Response**
```json
{ "result": { "success": true, "error": null } }
```
--------------------
#### Edit file (URL: fileManagerConfig.editUrl, Method: POST)
**JSON Request content**
```json
{
    "action": "edit",
    "item": "/public_html/index.php",
    "content": "<?php echo random(); ?>"
}
```
**JSON Response**
```json
{ "result": { "success": true, "error": null } }
```
--------------------
#### Get content of a file (URL: fileManagerConfig.getContentUrl, Method: POST)
**JSON Request content**
```json
{
    "action": "getContent",
    "item": "/public_html/index.php"
}
```
**JSON Response**
```json
{ "result": "<?php echo random(); ?>" }
```
--------------------
#### Create folder (URL: fileManagerConfig.createFolderUrl, Method: POST)
**JSON Request content**
```json
{
    "action": "createFolder",
    "newPath": "/public_html/new-folder"
}
```
**JSON Response**
```json
{ "result": { "success": true, "error": null } }
```
--------------------
#### Set permissions (URL: fileManagerConfig.permissionsUrl, Method: POST)
**JSON Request content**
```json
{
    "action": "changePermissions",
    "items": ["/public_html/root", "/public_html/index.php"],
    "perms": "rw-r-x-wx",
    "permsCode": "653",
    "recursive": true
}
```
**JSON Response**
```json
{ "result": { "success": true, "error": null } }
```
--------------------
#### Compress file (URL: fileManagerConfig.compressUrl, Method: POST)
**JSON Request content**
```json
{
    "action": "compress",
    "items": ["/public_html/photos", "/public_html/docs"],
    "destination": "/public_html/backups",
    "compressedFilename": "random-files.zip"
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
{
    "action": "extract",
    "destination": "/public_html/extracted-files",
    "item": "/public_html/compressed.zip",
    "folderName": "extract_dir"
}
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
#### Download / Preview file (URL: fileManagerConfig.downloadMultipleUrl, Method: GET)
**Http query params**
```
[fileManagerConfig.downloadFileUrl]?action=download&path=/public_html/image.jpg
```
**Response**
```
-File content
```
--------------------
#### Download multiples files in ZIP/TAR (URL: fileManagerConfig.downloadFileUrl, Method: GET)
**JSON Request content**
```json
{
    "action": "downloadMultiple",
    "items": ["/public_html/image1.jpg", "/public_html/image2.jpg"],
    "toFilename": "multiple-items.zip"
}}
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
