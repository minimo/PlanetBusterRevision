/*
* gulpfile.js
*/
const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');

exports.build = function(done) {
  return gulp.src(['./src/**/*.js'])
    .pipe(sourcemaps.init())  // ソースマップを初期化
    .pipe(concat('pbrev.js'))
    // .pipe(uglify())
    .pipe(sourcemaps.write()) // ソースマップの作成
    .pipe(gulp.dest('./build'));
};

exports.watch = function() {
    const targets = [
      './src/**/*.js',
    ];
    gulp.watch(targets, ['build']);
};
