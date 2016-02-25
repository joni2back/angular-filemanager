import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserify from 'browserify';
import watchify from 'watchify';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';
import sequence from 'run-sequence';
import browserSync from 'browser-sync';
import fs from 'fs';
import {spawn as spawn} from 'child_process';
import {Server} from 'karma';

const $ = gulpLoadPlugins();

const config = {
  fileSaver: {
    scripts: './src/*.js'
  },
  docs: {
    root: './docs',
    index: './docs/index.html',
    src: './docs/src',
    styles: './docs/assets/stylesheets/**/*.css',
    markdown: './readme.md',
    dest: './docs/dist'
  },
  dest: {
    docs: './docs/dist'
  },
  browserSync: {
    port: '3000',
    server: './docs'
  },
  // Predefined browserify configs to keep tasks DRY
  browserify: {
    fileSaver: {
      entryPoint: './src/angular-file-saver.module.js',
      bundleName: 'angular-file-saver.js',
      dest: './dist'
    },
    fileSaverBundle: {
      entryPoint: './src/angular-file-saver-bundle.module.js',
      bundleName: 'angular-file-saver.bundle.js',
      dest: './dist'
    },
    docs: {
      entryPoint: './docs/assets/js/custom.js',
      bundleName: 'examples.js',
      dest: './docs/dist'
    }
  },
  tests: {
    karma: __dirname + '/karma.conf.js'
  },
  // A flag attribute to switch modes.
  isProd: false
};

let browserifyDefaults = config.browserify.fileSaver;

/**
 * Helpers
 */

function fileContents(filePath, file) {
  return file.contents.toString();
}

/**
* Get arguments for release task from CLI
*/
function getUpdateType() {
  const env = $.util.env;

  if (env.version) {
    return { version: env.version };
  }

  return { type: env.type || 'patch'};
}

function getPackageJsonVersion() {
  return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
}

/**
* See http://blog.avisi.nl/2014/04/25/how-to-keep-a-fast-build-with-browserify-and-reactjs/
*/
function buildScript() {

  let bundler = browserify({
    entries: browserifyDefaults.entryPoint,
    debug: false,
    cache: {},
    packageCache: {},
    fullPaths: false
  });

  function rebundle() {
    const stream = bundler.bundle();

    return stream.on('error', err => {
        $.util.log(err.toString());
        this.emit('end');
      })
      .pipe(source(browserifyDefaults.bundleName))
      .pipe(buffer())
      .pipe(gulp.dest(browserifyDefaults.dest))
      .pipe($.if(config.isProd, $.uglify({
        compress: { drop_console: true }
      })))
      .pipe($.if(config.isProd, $.rename({
        suffix: '.min'
      })))
      .pipe($.if(config.isProd, gulp.dest(browserifyDefaults.dest)))
      .pipe($.if(browserSync.active, browserSync.stream()));
  }

  // Watch files for changes and only rebuilds what it needs to
  if (!config.isProd) {
    bundler = watchify(bundler);
    bundler.on('update', () => {
      rebundle();
    });
  }

  return rebundle();
}

gulp.task('scripts', () => {
  return buildScript();
});

gulp.task('styles:docs', () => {

  return gulp.src([
    config.docs.styles
  ])
  .pipe($.concat('examples.css'))
  .pipe(gulp.dest(config.dest.docs))
  .pipe($.if(browserSync.active, browserSync.stream()));
});

gulp.task('serve', () => {

  browserSync({
    port: config.browserSync.port,
    server: {
      baseDir: config.browserSync.server
    },
    logConnections: true,
    logFileChanges: true,
    notify: true
  });
});

gulp.task('markdown', () => {
  var markdown = gulp.src(config.docs.markdown).pipe($.markdown());

  return gulp.src(config.docs.index)
    .pipe($.inject(markdown, {
      transform: fileContents
    }))
    .pipe(gulp.dest(config.docs.root));
});

gulp.task('deploy:docs', () => {
  return gulp.src('./docs/**/*')
    .pipe($.ghPages());
});

gulp.task('build', cb => {
  sequence('build:src', 'build:docs', 'build:bundle', cb);
});

gulp.task('build:src', cb => {
  config.isProd = true;
  browserifyDefaults = config.browserify.fileSaver;

  sequence('scripts', cb);
});

gulp.task('build:bundle', cb => {
  config.isProd = true;
  browserifyDefaults = config.browserify.fileSaverBundle;

  sequence('scripts', cb);
});

gulp.task('build:docs', cb => {
  config.isProd = true;
  browserifyDefaults = config.browserify.docs;

  sequence(['scripts', 'styles:docs'], cb);
});

gulp.task('dev:docs', () => {
  config.isProd = false;
  browserifyDefaults = config.browserify.docs;

  sequence('markdown', ['scripts', 'styles:docs'], 'watch:docs');
});

gulp.task('watch:docs', ['serve'], () => {
  gulp.watch(config.docs.styles, ['styles:docs']);
});

gulp.task('release:bump', () => {

  return gulp.src('./*.json')
    .pipe($.bump(getUpdateType()))
    .pipe(gulp.dest('./'));
});

gulp.task('release:commit', ['release:bump'], cb => {
  const version = getPackageJsonVersion();

  return gulp.src('.')
    .pipe($.git.add())
    .pipe($.git.commit(':octocat: Bump to ' + version, cb));
});

gulp.task('release:push', ['release:bump', 'release:commit'], cb => {
  return $.git.push('origin', 'master', cb);
});

gulp.task('release:tag', ['release:bump', 'release:commit', 'release:push'], cb => {
  const version = getPackageJsonVersion();

  return $.git.tag(version, 'Tag: ' + version, err => {
    if (err) {
      return cb(err);
    }
    $.git.push('origin', 'master', {args: '--tags'}, cb);
  });
});

gulp.task('unit', (done) => {
  new Server({
    configFile: config.tests.karma,
    singleRun: true
  }, done).start();
});

gulp.task('release:npm', ['release:bump', 'release:commit', 'release:push', 'release:tag'], cb => {
  spawn('npm', ['publish'], { stdio: 'inherit' }).on('close', cb);
});

/**
* Automate npm & bower updates.
* $ gulp release --type major - using gulp-bump versioning
* $ gulp release --version 1.1.1 - using explicit version number
*/
gulp.task('release', ['release:bump', 'release:commit', 'release:push', 'release:tag', 'release:npm']);

gulp.task('default', ['build']);
