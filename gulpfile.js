'use strict';

// Require
const gulp = require('gulp');
const templateCache = require('gulp-angular-templatecache');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const minifyCss = require('gulp-clean-css');
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const del = require('del');
const path = require('path');

// Vars
var src = 'src/';
var dst = 'dist/';
var tplPath = 'src/templates'; //must be same as fileManagerConfig.tplPath
var jsFile = 'angular-filemanager.min.js';
var cssFile = 'angular-filemanager.min.css';

gulp.task('clean', function(cb) {
	del(dst + '/*', cb);
});

gulp.task('cache-templates', function() {
	return gulp.src(tplPath + '/*.html')
		.pipe(templateCache(jsFile, {
			module: 'FileManagerApp',
			base: function(file) {
				return tplPath + '/' + path.basename(file.history[0]);
			}
		}))
		.pipe(gulp.dest(dst));
});

gulp.task('concat-uglify-js', ['cache-templates'], function() {
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
		.pipe(minifyCss({
			compatibility: 'ie8'
		}))
		.pipe(concat(cssFile))
		.pipe(autoprefixer({
			browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Explorer > 10'],
			cascade: false
		}))
		.pipe(gulp.dest(dst));
});

gulp.task('lint', function() {
	return gulp.src([src + 'js/app.js', src + 'js/*/*.js'])
		.pipe(eslint({
			'rules': {
				'quotes': [2, 'single'],
				//'linebreak-style': [2, 'unix'],
				'semi': [2, 'always']
			},
			'env': {
				'browser': true
			},
			'globals': {
				'angular': true,
				'jQuery': true
			},
			'extends': 'eslint:recommended'
		}))
		.pipe(eslint.format())
		.pipe(eslint.failOnError());
});

gulp.task('default', ['concat-uglify-js', 'minify-css']);
// gulp.task('build', ['clean', 'lint', 'default']);
gulp.task('build', ['clean', 'default']);