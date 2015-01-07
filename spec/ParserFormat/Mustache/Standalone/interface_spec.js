var testHelper = require('../../test_helpers');
var ErrorMessage = testHelper.ErrorMessage;
var customMatchers = testHelper.customMatchers;
var parser = testHelper.parser;

beforeEach(function() {
    jasmine.addMatchers(customMatchers);
});

describe('interface declarations', function() {
    it('allows for interface declaration nodes', function() {
        var template = '{{>> str : string; }}';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    })
});
