'use strict';

// Gulp and node
const gulp = require('gulp');
const cp = require('child_process');
const notify = require('gulp-notify');
const size = require('gulp-size');

// Basic workflow plugins
const browserSync = require('browser-sync');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const clean = require('gulp-clean');
const sass = require('gulp-sass');
const jekyll = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
const messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

// Performance workflow plugins
const htmlmin = require('gulp-htmlmin');
const prefix = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

// Image Generation
const responsive = require('gulp-responsive');
const $ = require('gulp-load-plugins')();
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');

const src = {
  css: '_sass/main.scss',
  js: '_js/scripts.js',
}
const dist = {
  css: '_site/assets/css',
  js: '_site/assets/js',
}

function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);
  this.emit('end'); // Keep gulp from hanging on this task
}

// Build the Jekyll Site
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});

gulp.task('deploy', ['jekyll-build'], function () {
    return gulp.src('./_site/**/*')
        .pipe(deploy());
});

// Rebuild Jekyll & do page reload
gulp.task('rebuild', ['jekyll-build'], function (done) {
    browserSync.reload();
    done();
});

// Serve after jekyll-build
gulp.task('browser-sync', ['sass', 'js', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

// SASS
gulp.task('sass', function() {
  return gulp.src(src.css)
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: ['scss'],
      onError: browserSync.notify
    }).on('error', sass.logError))
    .pipe(prefix())
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(dist.css))
    .pipe(browserSync.reload({ stream: true }))
    .pipe(gulp.dest('assets/css'));
});

//  JS
gulp.task('js', function() {
  return browserify(src.js, {debug: true, extensions: ['es6']})
    .transform('babelify', {presets: ['es2015']})
    .bundle()
    .on('error', handleErrors)
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('./maps'))
    .pipe(size())
    .pipe(gulp.dest(dist.js))
    .pipe(browserSync.reload({stream: true}))
    .pipe(gulp.dest('assets/js'))
});

gulp.task('watch', function() {
  gulp.watch('_sass/**/*.scss', ['sass']);
  gulp.watch(['*.html', '_layouts/*.html', '_includes/*.html', '_posts/*.md',  'pages_/*.md', '_include/*html'], ['rebuild']);
  gulp.watch(src.js, ['js']);
});

gulp.task('default', ['browser-sync', 'watch']);

// Minify HTML
gulp.task('html', function() {
    gulp.src('./_site/index.html')
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(gulp.dest('./_site'))
    gulp.src('./_site/*/*html')
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(gulp.dest('./_site/./'))
});

// Images
gulp.task('img', function() {
  return gulp.src('_img/posts/*.{png,jpg}')
    .pipe($.responsive({
      // For all the images in the folder
      '*': [{
        width: 230,
        format: 'jpeg',
        rename: {suffix: '_placehold', extname: '.jpg' },
      }, {
        // thubmnail
        width: 535,
        format: 'jpeg',
        rename: { suffix: '_thumb', extname: '.jpg' },
      }, {
        // thumbnail @2x
        width: 535 * 2,
        format: 'jpeg',
        rename: { suffix: '_thumb@2x', extname: '.jpg' },
      }, {
        width: 575,
        format: 'jpeg',
        rename: { suffix: '_xs', extname: '.jpg' }
      }, {
        width: 767,
        format: 'jpeg',
        rename: {suffix: '_sm', extname: '.jpg' }
      }, {
        width: 991,
        format: 'jpeg',
        rename: { suffix: '_md', extname: '.jpg' }
      }, {
        width: 1999,
        format: 'jpeg',
        rename: { suffix: '_lg', extname: '.jpg' }
      }, {
        // max-width hero
        width: 1920,
        format: 'jpeg',
        rename: { extname: '.jpg' }
      }],
    }, {
      quality: 70,
      progressive: true,
      withMetadata: false,
    }))
    .pipe(imagemin())
    .pipe(gulp.dest('assets/img/posts/'));
});


gulp.task('clean', function () {
    return gulp.src('_site', {read: false})
      .pipe(clean());
});

gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: '_site'
    }
  });
});

gulp.task('build', ['sass', 'js', 'jekyll-build', 'img']);

gulp.task('build-fe', ['sass', 'js', 'img']);
