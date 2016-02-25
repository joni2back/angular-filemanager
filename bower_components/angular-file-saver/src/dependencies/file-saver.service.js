'use strict';

module.exports = function SaveAs($window, FileSaverUtils) {
  var saveAs = $window.saveAs;

  if (FileSaverUtils.isUndefined(saveAs)) {
    FileSaverUtils.handleErrors('saveAs is not supported. Please include saveAs polyfill');
  }

  return saveAs;
};
