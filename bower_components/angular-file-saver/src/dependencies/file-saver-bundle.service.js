'use strict';

module.exports = function SaveAs() {
  return require('FileSaver.js').saveAs || function() {};
};
