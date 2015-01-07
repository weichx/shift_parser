var testHelper = require('../test_helpers');
var ErrorMessage = testHelper.ErrorMessage;
var customMatchers = testHelper.customMatchers;
var parser = testHelper.parser;

beforeEach(function() {
    jasmine.addMatchers(customMatchers);
});

describe('HTML attributes', function () {
    it('allows html open tags to have attributes', function () {
        var template = '<div id="someId"></div>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('does not allow html close tags to have attributes', function () {
        var template = '<div></div id="someId>';
        expect(function () {
            parser.parse(template)
        }).toThrow();
    });

    it('requires attributes to be inside quotes', function () {
        var template = '<div id=someId></div>';
        expect(function () {
            parser.parse(template)
        }).toThrow();
        template = '<div id="someId"></div>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
        template = "<div id='someid'></div>";
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it("allows mustache variables as attributes", function () {
        var template = "<div id='{{someid}}'></div>";
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('will allow nested object literals in an attribute', function() {
        var template = "<div id='{v:{someid}}'></div>";
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('allows formatters inside mustache variables when used as attributes', function() {
        var template = "<div id='{{v | currency(dollar)}}'></div>";
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('allows self closed html tags to have mustache attributes', function() {
        var template = '<html><input attr="{{something}}"/><br/></html>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

});
