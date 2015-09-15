## angular-filemanager

A very smart filemanager to manage your files in the browser developed in AngularJS with Material-Design styles by [Jonas Sciangula Street](https://github.com/joni2back)

#### [Try the DEMO](http://angular-filemanager.zendelsolutions.com/)
---------

***Important:*** We need a collaborator to improve the [docs](API.md) !

---------
![alt tag](https://raw.githubusercontent.com/joni2back/angular-filemanager/master/screenshot1.png)
![alt tag](https://raw.githubusercontent.com/joni2back/angular-filemanager/master/screenshot2.png)
![alt tag](https://raw.githubusercontent.com/joni2back/angular-filemanager/master/screenshot3.png)

### Features
  - Multilanguage (English / Spanish / Portuguese / French)
  - Multiple templates (List / Icons)
  - Multiple file upload
  - Search files
  - Directory tree navigation
  - Copy, Move, Rename (Interactive UX)
  - Delete, Edit, Preview, Download
  - File permissions (Unix chmod style)
  - Mobile support

### TODO
  - Improve the docs
  - Multiple file selector
  - Drag and drop
  - Dropbox and Google Drive compatibility
  - Extend backend bridges (PHP, Java, Python, Node, .Net)

### Backend API
[Read the docs](API.md)

---------

### Use in your existing project
**1) Install and use**
```bower install --save angular-filemanager```

**2) Include the dependencies in your project**
```html
<!-- third party -->
  <script src="bower_components/angular/angular.min.js"></script>
  <script src="bower_components/angular-translate/angular-translate.min.js"></script>
  <script src="bower_components/angular-cookies/angular-cookies.min.js"></script>
  <script src="bower_components/jquery/dist/jquery.min.js"></script>
  <script src="bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
  <link rel="stylesheet" href="bower_components/bootswatch/paper/bootstrap.min.css" />

<!-- angular-filemanager -->
  <link rel="stylesheet" href="dist/angular-filemanager.css">
  <script src="dist/angular-filemanager.min.js"></script>
```

**3) Use the angular directive in your HTML**
```html
<angular-filemanager></angular-filemanager>
```

---------

### Using source files instead of minified js
```html
<!-- Uncomment if you need to use raw source code
  <script src="src/js/app.js"></script>
  <script src="src/js/directives/directives.js"></script>
  <script src="src/js/filters/filters.js"></script>
  <script src="src/js/providers/config.js"></script>
  <script src="src/js/entities/chmod.js"></script>
  <script src="src/js/entities/item.js"></script>
  <script src="src/js/services/filenavigator.js"></script>
  <script src="src/js/services/fileuploader.js"></script>
  <script src="src/js/providers/translations.js"></script>
  <script src="src/js/controllers/main.js"></script>
  <script src="src/js/controllers/selector-controller.js"></script>
  <link href="src/css/angular-filemanager.css" rel="stylesheet">
-->

<!-- Comment if you need to use raw source code -->
  <link href="dist/angular-filemanager.css" rel="stylesheet">
  <script src="dist/angular-filemanager.min.js"></script>
<!-- /Comment if you need to use raw source code -->
```

---------

### Extending the configuration file
```html
<script type="text/javascript">
  angular.module('FileManagerApp').config(['fileManagerConfigProvider', function (config) {
    var defaults = config.$get();
    config.set({
      appName: 'github.com/joni2back/angular-filemanager',
      allowedActions: angular.extend(defaults.allowedActions, {
        remove: true
      })
    });
  }]);
</script>
```

---------

### Contribute
To contribute to the project you can simply fork this repo. To build a minified version, you can simply run the Gulp 
task `gulp build`. The minified/uglified files are created in the `dist` folder. 

### Versioning
For transparency into our release cycle and in striving to maintain backward compatibility, angular-filemanager is maintained under [the Semantic Versioning guidelines](http://semver.org/).

### Copyright and license
Code and documentation released under [the MIT license](https://github.com/joni2back/angular-filemanager/blob/master/LICENSE).
