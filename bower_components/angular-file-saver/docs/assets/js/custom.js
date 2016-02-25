'use strict';

var angular = require('angular');
require('../../../src/angular-file-saver-bundle.module');

function DownloadText(FileSaver, Blob, $timeout) {
  var vm = this;

  vm.val = {
    text: 'Hey ho lets go!'
  };

  vm.download = function(text) {
    var data = new Blob([text], { type: 'text/plain;charset=utf-8' });
    $timeout(FileSaver.saveAs.bind(FileSaver, data, 'text.txt'), 100);
  };
}

angular
  .module('fileSaverExample', ['ngFileSaver'])
  .controller('DownloadText', ['FileSaver', 'Blob', '$timeout', DownloadText]);
