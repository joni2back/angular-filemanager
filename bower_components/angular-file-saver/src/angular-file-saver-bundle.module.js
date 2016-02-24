'use strict';
module.exports = 'ngFileSaver';
/*
*
* A AngularJS module that implements the HTML5 W3C saveAs() in browsers that
* do not natively support it
*
* (c) 2015 Philipp Alferov
* License: MIT
*
*/

angular.module('ngFileSaver', [])
  .factory('FileSaver', ['Blob', 'SaveAs', 'FileSaverUtils', require('./angular-file-saver.service')])
  .factory('FileSaverUtils', [require('./utils/utils.service.js')])
  .factory('Blob', ['$window', require('./dependencies/blob-bundle.service.js')])
  .factory('SaveAs', [require('./dependencies/file-saver-bundle.service.js')]);
