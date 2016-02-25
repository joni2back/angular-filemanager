'use strict';

module.exports = function Blob($window, FileSaverUtils) {
  var blob = $window.Blob;

  if (FileSaverUtils.isUndefined(blob)) {
    FileSaverUtils.handleErrors('Blob is not supported. Please include blob polyfilll');
  }

  return blob;
};
