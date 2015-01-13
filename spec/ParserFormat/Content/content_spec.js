var testHelper = require('../test_helpers');
var parser = testHelper.parser;
var ErrorMessage = testHelper.ErrorMessage;

describe('content', function() {
    it('can be at the root', function() {
        var template = 'here';
        expect(function() {
            parser.parse(template)
        }).not.toThrow();
    });

    it('can be in a mustache block', function() {
        var template = '{{#if true}} here {{/if}}';
        expect(function() {
            parser.parse(template)
        }).not.toThrow();
    });

    it('can be in an html block', function() {
        var template = '<html> here </html>';
        expect(function() {
            parser.parse(template)
        }).not.toThrow();
    });

    it("will escape mustaches with {{{", function() {
        var template = '{{{';
        expect(function() {
            parser.parse(template);
        }).not.toThrow();
    });
});