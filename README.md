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
      
      allowedActions: {
         rename: true,
         copy: true,
         edit: true,
         changePermissions: true,
         compress: true,
         extract: true,
         download: true,
         preview: true,
         delete: true
      },
      
      enablePermissionsRecursive: true,
    
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
  - Mobile support

### TODO
  - Multiple file selector
  - Dropbox and Google Drive compatibility
  - Extend backend bridges (PHP, Java, Python, Node, .Net)

### Backend API
[Read the documentation](API.md)

### Use in your existing project
**1) Install and use**
```bower install --save angular-filemanager```

**2) Include the dependencies in your project**
```html
<!-- third party -->
<script src="/bower_components/angular-translate/angular-translate.min.js"></script>
<script src="/bower_components/angular-cookies/angular-cookies.min.js"></script>
<!-- angular-filemanager -->
<link rel="stylesheet" href="/bower_components/angular-filemanager/dist/angular-filemanager.css">
<script src="/bower_components/angular-filemanager/dist/angular-filemanager.min.js"></script>
<script src="/bower_components/angular-filemanager/dist/cached-templates.js"></script>
```

**3) Use the angular directive in your HTML**
```html
<angular-file-manager></angular-file-manager>
```

### Contribute
To contribute to the project you can simply fork this repo. To build a minified version, you can simply run the Gulp 
task `gulp build`. The minified/uglified files are created in the `dist` folder. 
Special thanks to [@silentHoo](https://github.com/silentHoo).

### Contribute
To contribute to the project you can simply fork this repo. To build a minified version, you can simply run the Gulp 
task `gulp build`. The minified/uglified files are created in the `dist` folder.

### Versioning
For transparency into our release cycle and in striving to maintain backward compatibility, angular-filemanager is 
maintained under [the Semantic Versioning guidelines](http://semver.org/).

### Copyright and license
Code and documentation released under [the MIT license](https://github.com/joni2back/angular-filemanager/blob/master/LICENSE).