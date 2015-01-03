var gulp = require('gulp');
var gulpShell = require('gulp-shell');
var typescript = require('gulp-tsc');
var jasmine = require('gulp-jasmine');

gulp.task('compile', function () {
    var stream = gulp.src(['src/**/*.ts'])
        .pipe(typescript({
            target: 'ES5',
            declaration: true,
            sourcemap: true
        }))
        .pipe(gulp.dest('dest/'));
    stream.on('error', function (error) {
        console.log('error');
    });
    return stream;
});

gulp.task('jasmine', ['compile'], function () {
    return gulp.src('spec/**/*.js').pipe(jasmine({includeStackTrace: true}));
});

gulp.task('test', ['compile', 'jasmine']);

var fs = require('fs');

gulp.task('test_parse', ['compile'], function() {
    var DTSParser = require('./dest/DTSParser/DTSParser');
    var str = fs.readFileSync('dest/Parser/Util.d.ts').toString();
    var parser = new DTSParser();
    parser.parse(str);
    return gulp.src('');
});
