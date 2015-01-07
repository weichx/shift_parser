var testHelper = require('../test_helpers');
var ErrorMessage = testHelper.ErrorMessage;
var customMatchers = testHelper.customMatchers;
var parser = testHelper.parser;

beforeEach(function () {
    jasmine.addMatchers(customMatchers);
});

describe('HTML children', function () {
    it('allows html to have children, starting with content', function () {
        var template = '<html>dont blow up{{stash}}</html>';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('allows html to have children, starting with a mustache', function () {
        var template = '<html>{{stash}}dont blow up <div></div></html>';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('allows html to have children, starting with html', function () {
        var template = '<html><div></div>dont blow up{{stash}}</html>';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('allows html to have really nested children', function () {
        var template = '<html><div><ul><li><a><p>text{{#if stuff}}<input/>{{/if}}</p></a></li></ul></div>dont blow up{{stash}}</html>';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('allows html to have self closing children', function () {
        var template = '<html><input/></html>';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('allows html to have children with attributes', function () {
        var template = '<html><input id="test" class="input" type="input"/></html>';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('allows html to have children with mustache attributes', function () {
        var template = '<html><input id="{{test}}" class="input" type="input"/></html>';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });
});