var gulp = require('gulp');
var typescript = require('gulp-tsc');
var jasmine = require('gulp-jasmine');
var peg = require('pegjs');
var concat = require('gulp-concat');
var eyes = require('eyes');

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

gulp.task('compilePeg', function() {
    return gulp.src(['peg/0_HeaderJSCode.js', 'peg/**/*.pegjs'])
        .pipe(concat('PegParser.pegjs'))
        .pipe(gulp.dest('./'));
});

gulp.task('peg', ['compilePeg'], function() {
    var str = fs.readFileSync('PegParser.pegjs').toString();
    var template = fs.readFileSync('template-test.shift').toString();
    try {
        var startBuild = Date.now();
        var parser = peg.buildParser(str);
        console.log('parser build time: ' + (Date.now() - startBuild));

        var startParse = Date.now();
        eyes.inspect(parser.parse(template, {startRule: 'StartProgram'}), {maxLength: 10000});
        console.log('parse time: ' + (Date.now() - startParse));

    } catch(e) {
        console.log(e);
    }
});

gulp.task('testpeg', ['compilePeg'], function() {
    return gulp.src(['spec/ParserFormat/**/*_spec.js']).pipe(jasmine({includeStackTrace: true}));
});

gulp.task('compile_thread', function() {
    gulp.src('Thread/**/*.ts')
        .pipe(typescript({
            target: 'ES5',
            declaration: true,
            sourcemap: true
        }))
        .pipe(gulp.dest('thread_build/'));
});