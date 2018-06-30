/*
* gulpfile.js
*/
const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('build', function() {
  gulp.src(['src/**/*.js'])
    .pipe(sourcemaps.init())  // ソースマップを初期化
    .pipe(concat('pbrev.js'))
    // .pipe(uglify())
    .pipe(sourcemaps.write()) // ソースマップの作成
    .pipe(gulp.dest('./build'));
});


///////////////////////////////
// var gulp = require('gulp');
// var gutil = require('gulp-util');
// var ghelper = require('gulp-helper');
// ghelper.require();

// var pkg = require('./package.json');
// var config = require('./src/config.json');

// gulp.task('default', ['concat', 'uglify']);

// gulp.task('concat', function() {
//   var scripts = config.files.map(function(f) {
//     return './src/' + f;
//   });

//   return gulp.src(scripts)
//     .pipe(concat('pbrev.js'))
//     .pipe(replace('<%= version %>', pkg.version))
//     .pipe(gulp.dest('./build/'))
//     ;
// });

// gulp.task('uglify', ['concat'], function() {
//   return gulp.src('./build/pbrev.js')
//     .pipe(uglify())
//     .pipe(rename({
//       extname: '.min.js'
//     }))
//     .pipe(gulp.dest('./build/'))
//     .on('end', function() {
//       util.log(util.colors.blue('finish'));
//       gutil.beep();
//     });
// });

