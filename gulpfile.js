'use strict';

// Require
var gulp = require('gulp');
var templateCache = require('gulp-angular-templatecache');  // caches the templates with $templateCache
var uglify = require('gulp-uglify');                        // minifies JavaScript
var minifyCss = require('gulp-minify-css');                 // minifies CSS
var concat = require('gulp-concat');                        // concat JavaScript
var del = require('del');
var path = require('path');

// Vars
var src = 'src/';
var dst = 'dist/';
var tplPath = 'src/templates' //must be same as fileManagerConfig.tplPath
var jsFile = 'angular-filemanager.min.js';

gulp.task('clean', function (cb) {
  del(dst + '/*', cb);
});

gulp.task('cache-templates', function () {
  return gulp.src(tplPath + '/*.html')
    .pipe(templateCache(jsFile, {
      module: 'FileManagerApp',
      base: function(file) {
        return tplPath + '/' + path.basename(file.history);
      }
    }))
    .pipe(gulp.dest(dst));
});

gulp.task('concat-uglify-js', ['clean', 'cache-templates'], function() {
  return gulp.src([
    src + 'js/app.js',
      src + 'js/*/*.js',
      dst + '/' + jsFile
    ])
    .pipe(concat(jsFile))
    .pipe(uglify())
    .pipe(gulp.dest(dst));
});

gulp.task('minify-css', function() {
  return gulp.src(src + 'css/*.css')
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(gulp.dest(dst));
});

gulp.task('default', ['concat-uglify-js', 'minify-css']);
gulp.task('build', ['default']);
