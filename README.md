# angular-filemanager
File manager developed with AngularJS and Bootstrap by [Jonas Sciangula Street](https://github.com/joni2back)


#### [Try the DEMO (only listing and file editor)](http://zendelsolutions.com/zendel/projects/angular-filemanager)
---------
![alt tag](https://raw.githubusercontent.com/joni2back/angular-filemanager/master/angular-filemanager.png)
![alt tag](https://raw.githubusercontent.com/joni2back/angular-filemanager/master/angular-filemanager-mobile.png)  Mobile support

## App Features
  - Multilanguage (English / Spanish / Portuguese)
  - Multiple templates (List / Icons)
  - Multiple file upload
  - Search files
  - Directory tree navigation
  - Copy (Interactive UX)
  - Move (Interactive UX)
  - Rename
  - Delete
  - Edit
  - Preview
  - Download
  - File permissions (Unix Chmod style)

## External Libs / Plugins used
  - [@angular](https://github.com/angular/angular)
  - [@angular-cookies](https://github.com/angular/bower-angular-cookies)
  - [@angular-translate](https://github.com/angular-translate/angular-translate)
  - [@bootstrap](https://github.com/twbs/bootstrap)
  - [@jquery](https://github.com/jquery/jquery)

## TODO
  - Multiple file selector (nice to have)
  - Backend controllers (PHP, Python, NodeJS, .Net, etc)

--------------------
## Backend API

### Listing
    URL: $config.listUrl
    Method: POST
#### JSON Request content
```json
{
    "params": {
        "mode": "list",
        "onlyFolders": false,
        "path": "/public_html"
    }
}
```
#### JSON Response
```json
{
    "result": [
        {
            "name": "joomla",
            "rights": "drwxr-xr-x",
            "size": "4096",
            "time": "16:07",
            "type": "dir"
        },
        {
            "name": "magento",
            "rights": "drwxr-xr-x",
            "size": "4096",
            "time": "17:42",
            "type": "dir"
        },
        {
            "name": ".htaccess",
            "rights": "-rw-r--r--",
            "size": "0",
            "time": "17:42",
            "type": "file"
        },
        {
            "name": "index.php",
            "rights": "-rw-r--r--",
            "size": "0",
            "time": "17:41",
            "type": "file"
        }
    ]
}
```

--------------------

### Rename / Move
    URL: $config.renameUrl
    Method: POST
#### JSON Request content
```json
{
    "params": {
        "mode": "rename",
        "path": "/public_html/index.php",
        "newPath": "/public_html/index2.php"
    }
}
```
#### JSON Response
```json
{
    "result": {
        "success": true,
        "error": null
    }
}
```

--------------------

### Copy
    URL: $config.copyUrl
    Method: POST
#### JSON Request content
```json
{
    "params": {
        "mode": "copy",
        "path": "/public_html/index.php",
        "newPath": "/public_html/index-copy.php"
    }
}
```
#### JSON Response
```json
{
    "result": {
        "success": true,
        "error": null
    }
}
```

--------------------

### Remove
    URL: $config.removeUrl
    Method: POST
#### JSON Request content
```json
{
    "params": {
        "mode": "delete",
        "path": "/public_html/index.php",
    }
}
```
#### JSON Response
```json
{
    "result": {
        "success": true,
    	"error": null
    }
}
```

--------------------

### Edit file
    URL: $config.removeUrl
    Method: POST

#### JSON Request content
```json
{
    "params": {
        "mode": "edit",
        "content": "<?php echo random(); ?>",
        "path": "/public_html/index.php",
    }
}
```

#### JSON Response
```json
{
    "result": {
        "success": true,
        "error": null
    }
}
```

--------------------

### Get content of a file
    URL: $config.getContentUrl
    Method: POST
#### JSON Request content
```json
{
    "params": {
        "mode": "editfile",
        "path": "/public_html/index.php",
    }
}
```
#### JSON Response
```json
{
    "result": "<?php echo random(); ?>",
}
```

--------------------

### Create folder
    URL: $config.createFolderUrl
    Method: POST

#### JSON Request content
```json
{
    "params": {
        "mode": "addfolder",
        "name": "new-folder",
        "path": "/public_html"
    }
}
```
#### JSON Response
```json
{
    "result": {
        "success": true,
        "error": null
    }
}
```

--------------------

### Compress file
    URL: $config.compressUrl
    Method: POST
#### JSON Request content
```json
{
    "params": {
        "mode": "compress",
        "path": "/public_html/compressed.zip",
        "destination": "/public_html/backups"
    }
}
```
#### JSON Response
```json
{
    "result": {
        "success": true,
        "error": null
    }
}
```

--------------------

### Extract file
    URL: $config.extractUrl
    Method: POST
#### JSON Request content
```json
{
    "params": {
        "mode": "extract",
        "destination": "/public_html/extracted-files",
        "path": "/public_html/compressed.zip",
        "sourceFile": "/public_html/compressed.zip"
    }
}
```
#### JSON Response
```json
{
    "result": {
        "success": true,
        "error": null
    }
}
```

--------------------

### Upload file
    URL: $config.uploadUrl
    Method: POST
    Content-Type: multipart/form-data
    Unlimited file upload, each item will be enumerated as file-1, file-2, etc.
#### Http post params
```
[$config.uploadUrl]?destination=/public_html/image.jpg&file-1={..}&file-2={...}
```
#### JSON Response
```json
{
    "result": {
        "success": true,
        "error": null
    }
}
```

--------------------

### Download / Preview file
    URL: $config.downloadFileUrl
    Method: GET

#### Http query params
```
[$config.downloadFileUrl]?mode=download&preview=true&path=/public_html/image.jpg
```
#### Response
```
-File content
```
--------------------

#### Errors / Exceptions
Every backend errors should be with an Error 500 HTTP code.

Btw, you can report errors with a 200 response with this json structure
```json
{
    "result": {
        "success": false,
        "error": "Access denied to remove file"
    }
}
