'use strict';

const { src, dest, watch, series } = require('gulp'),
  sass = require('gulp-sass'),
  concat = require('gulp-concat'),
  terser = require('gulp-terser-js'),
  rename = require('gulp-rename'),
  sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'),
  imagemin = require('gulp-imagemin'),
  changed = require('gulp-changed'),
  newer = require('gulp-newer'),
  cleanCSS = require('gulp-clean-css'),
  cleanDir = require('gulp-clean-dir'),
  browserSync = require('browser-sync').create(),
  path = {
    scss: {
      src: './resources/sass/**/*.scss',
      dest: './resources/css',
    },
    css: {
      src: './resources/css/**/*.{css,map}',
      dest: './public/css',
    },
    js: {
      src: './resources/js/main.js',
      dest: './public/js',
    },
    img: {
      src: './resources/img/**/*.*',
      dest: './public/img',
    },
    materialize: {
      src: './resources/js/materialize.min.js',
      dest: './public/js',
    },
    laravel: {
      app: './app/**/*',
      routes: './routes/**/*',
      views: './resources/views/**/*.php',
    },
  };

function buildCSS() {
  return src(path.scss.src)
    .pipe(sourcemaps.init())
    .pipe(changed(path.scss.dest))
    .pipe(sass().on('error', sass.logError))
    .pipe(rename('materialize.min.css'))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('.'))
    .pipe(cleanDir(path.scss.dest))
    .pipe(dest(path.scss.dest))
    .pipe(browserSync.stream());
}

function copyCSS() {
  return src(path.css.src)
    .pipe(cleanCSS())
    .pipe(cleanDir(path.css.dest))
    .pipe(dest(path.css.dest));
}

function buildJS() {
  return src(path.js.src)
    .pipe(sourcemaps.init())
    .pipe(changed(path.js.dest))
    .pipe(terser())
    .pipe(concat('main.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(cleanDir(path.js.dest))
    .pipe(dest(path.js.dest))
    .pipe(browserSync.stream());
}

function copyMaterializeJS() {
  return src(path.materialize.src).pipe(dest(path.materialize.dest));
}

function copyImages() {
  return src(path.img.src)
    .pipe(newer(path.img.dest))
    .pipe(imagemin())
    .pipe(cleanDir(path.img.dest))
    .pipe(dest(path.img.dest));
}

function serve() {
  browserSync.init({
    //server: './app.js',
    open: 'local',
    host: 'localhost',
    proxy: 'http://127.0.0.1:3000',
  });

  watch(path.scss.src, series(buildCSS, copyCSS));
  watch(path.js.src, series(buildJS, copyMaterializeJS));
  watch(path.img.src, copyImages);
  watch([path.laravel.app, path.laravel.views, path.laravel.routes]).on(
    'change',
    browserSync.reload
  );
}

exports.scss = buildCSS;
exports.css = copyCSS;
exports.js = buildJS;
exports.materialize = copyMaterializeJS;
exports.img = copyImages;
exports.default = serve;
