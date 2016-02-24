'use strict';

module.exports = function FileSaver(Blob, SaveAs, FileSaverUtils) {

  function save(blob, filename, disableAutoBOM) {
    try {
      SaveAs(blob, filename, disableAutoBOM);
    } catch(err) {
      FileSaverUtils.handleErrors(err.message);
    }
  }

  return {

    /**
    * saveAs
    * Immediately starts saving a file, returns undefined.
    *
    * @name saveAs
    * @function
    * @param {Blob} data A Blob instance
    * @param {Object} filename Custom filename (extension is optional)
    * @param {Boolean} disableAutoBOM Disable automatically provided Unicode
    * text encoding hints
    *
    * @return {Undefined}
    */

    saveAs: function(data, filename, disableAutoBOM) {

      if (!FileSaverUtils.isBlobInstance(data)) {
        FileSaverUtils.handleErrors('Data argument should be a blob instance');
      }

      if (!FileSaverUtils.isString(filename)) {
        FileSaverUtils.handleErrors('Filename argument should be a string');
      }

      return save(data, filename, disableAutoBOM);
    }
  };
};
