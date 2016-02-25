'use strict';

module.exports = function(config) {
  config.set({
    basePath: './',
    frameworks: ['jasmine', 'browserify'],
    preprocessors: {
      'src/**/*.js': ['browserify']
    },
    browsers: ['Chrome', 'Firefox'],
    nyanReporter: {
      suppressErrorReport: true,
      suppressErrorHighlighting: true,
      numberOfRainbowLines: 4
    },
    autoWatch: false,
    browserify: {
      debug: true,
      transform: []
    },
    proxies: {
      '/': 'http://localhost:9876/'
    },
    urlRoot: '/__karma__/',
    singleRun: true,
    files: [
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'src/angular-file-saver-bundle.module.js',
      // Test files
      'test/**/*.spec.js'
    ]
  });
};
