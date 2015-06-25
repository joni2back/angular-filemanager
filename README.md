## angular-filemanager
File manager developed with AngularJS and Bootstrap by [Jonas Sciangula Street](https://github.com/joni2back)

#### [Try the DEMO](http://zendelsolutions.com/zendel/projects/angular-filemanager)
---------
![alt tag](https://raw.githubusercontent.com/joni2back/angular-filemanager/master/angular-filemanager.png)
![alt tag](https://raw.githubusercontent.com/joni2back/angular-filemanager/master/angular-filemanager-mobile.png)

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

### Versioning
For transparency into our release cycle and in striving to maintain backward compatibility, angular-filemanager is maintained under [the Semantic Versioning guidelines](http://semver.org/).

### Copyright and license
Code and documentation released under [the MIT license](https://github.com/joni2back/angular-filemanager/blob/master/LICENSE).