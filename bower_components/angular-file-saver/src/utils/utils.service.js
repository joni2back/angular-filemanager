'use strict';

module.exports = function FileSaverUtils() {
  return {
    handleErrors: function(msg) {
      throw new Error(msg);
    },
    isString: function(obj) {
      return typeof obj === 'string' || obj instanceof String;
    },
    isUndefined: function(obj) {
      return typeof obj === 'undefined';
    },
    isBlobInstance: function(obj) {
      return obj instanceof Blob;
    }
  };
};
