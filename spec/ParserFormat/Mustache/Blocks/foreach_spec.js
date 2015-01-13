var testHelper = require('../../test_helpers');
var ErrorMessage = testHelper.ErrorMessage;
var customMatchers = testHelper.customMatchers;
var parser = testHelper.parser;

describe('foreach block', function() {
    it('should be declarable', function() {
        var template = '{{#foreach array >> $index:i}} content {{/foreach}}';
        expect(function() {
            parser.parse(template);
        }).not.toThrow();
    });


});