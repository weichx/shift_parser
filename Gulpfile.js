var gulp = require('gulp');
var typescript = require('gulp-tsc');
var jasmine = require('gulp-jasmine');

gulp.task('compile', function(){
    gulp.src(['src/**/*.ts'])
        .pipe(typescript({
            target: 'ES5',
            declaration: true,
            sourcemap: true,
            tscPath: 'node_modules/typescript/bin/tsc'
        }))
        .pipe(gulp.dest('dest/'))
});

gulp.task('jasmine', ['compile'], function () {
    return gulp.src('spec/test_spec.js').pipe(jasmine());
});

gulp.task('test', ['compile', 'jasmine']);