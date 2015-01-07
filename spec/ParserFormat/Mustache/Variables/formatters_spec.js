var testHelper = require('../../test_helpers');
var parser = testHelper.parser;
var ErrorMessage = testHelper.ErrorMessage;

beforeEach(function () {
    jasmine.addMatchers(testHelper.customMatchers);
});

describe('Variable formatters', function () {
    it('can handle mustache variables with formatters', function () {
        var template = 'content {{variable | curreny(dollar) }} <div>  content {{v |c}} </div>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('does not require formatters to have variants', function () {
        var template = 'content {{variable}} <div></div>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('does not allow multiple variants in formatters', function () {
        var template = 'content {{variable | f(c d)}} <div></div>';
        expect(function () {
            parser.parse(template)
        }).toThrow();
    });

    it('allows a variable to have multiple formatters', function () {
        var template = 'content {{variable | f(c) | d(c) | o(b) }} <div></div>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('disallows invalid variable names to formatters', function () {
        var template = 'content {{variable | f(%%) | d(c) | o(b) }} <div></div>';
        expect(function () {
            parser.parse(template)
        }).toThrow();
    });
});
