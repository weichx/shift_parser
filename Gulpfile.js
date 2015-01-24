var gulp = require('gulp');
var typescript = require('gulp-tsc');
var jasmine = require('gulp-jasmine');
var peg = require('pegjs');
var concat = require('gulp-concat');
var eyes = require('eyes');
var fs = require('fs');


gulp.task('compilePeg', function() {
    return gulp.src(['peg/HeaderJSCode.js', 'peg/Parser.pegjs', 'peg/**/*.pegjs'])
        .pipe(concat('PegParser.pegjs'))
        .pipe(gulp.dest('./'));
});

gulp.task('peg', ['compilePeg'], function() {
    var str = fs.readFileSync('PegParser.pegjs').toString();
    var template = fs.readFileSync('templates/template-test.shift').toString();
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
