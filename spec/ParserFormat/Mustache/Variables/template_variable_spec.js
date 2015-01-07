var testHelper = require('../../test_helpers');
var parser = testHelper.parser;
var ErrorMessage = testHelper.ErrorMessage;

beforeEach(function () {
    jasmine.addMatchers(testHelper.customMatchers);
});

describe('template variables', function() {
    it('allow template variable symbols', function () {
        var template = '{{&template}}';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('allows template variables to have formatters', function() {
        var template = '{{&template | formatMe |formatMe(thisway)}}';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('allows template variables to have a compute block', function() {

    });

});