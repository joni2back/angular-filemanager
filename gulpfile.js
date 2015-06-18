'use strict';

// Require
var gulp = require('gulp');
var templateCache = require('gulp-angular-templatecache');

// Vars
var src = './assets/';
var dst = './dist/';

gulp.task('default', function () {
  gulp.src(src + 'templates/*.html')
    .pipe(templateCache('cached-templates.js', {
      module: 'cached-templates'
    }))
    .pipe(gulp.dest('build'));
});