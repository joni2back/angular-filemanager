'use strict';

// Require
var gulp = require('gulp');
var templateCache = require('gulp-angular-templatecache');  // caches the templates with $templateCache
var uglify = require('gulp-uglify');                        // minifies JavaScript
var minifyCss = require('gulp-minify-css');                 // minifies CSS
var concat = require('gulp-concat');                        // concat JavaScript

// Vars
var src = './assets/';
var dst = './dist/';

gulp.task('cache-templates', function () {
  return gulp.src(src + 'templates/*.html')
    .pipe(templateCache('cached-templates.js', {
      module: 'FileManagerApp'
    }))
    .pipe(gulp.dest(dst));
});

gulp.task('concat-uglify-cache-js', function() {
  return gulp.src([
      'app.js',
      'config.js',
      'chmod.js',
      'item.js',
      'filenavigator.js',
      'fileuploader.js',
      'translations.js',
      'controller.js',
      'selector-controller.js'
    ])
    .pipe(concat('angular-filemanager.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(dst))
});

gulp.task('minify-css', function() {
  return gulp.src(src + 'css/*.css')
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(gulp.dest(dst));
});

gulp.task('default', ['cache-templates', 'concat-uglify-cache-js', 'minify-css']);