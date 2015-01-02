var gulp = require('gulp');
var typescript = require('gulp-tsc');
var jasmine = require('gulp-jasmine');

gulp.task('compile', function (done) {
    var stream = gulp.src(['src/**/*.ts'])
        .pipe(typescript({
            target: 'ES5',
            declaration: true,
            sourcemap: true
        }))
        .pipe(gulp.dest('dest/'));
    stream.on('end', done);
    stream.on('error', function (error) {
        done(error);
    });
});

gulp.task('jasmine', ['compile'], function () {
    return gulp.src('spec/**/*.js').pipe(jasmine({includeStackTrace: true}));
});

gulp.task('test', ['compile', 'jasmine']);