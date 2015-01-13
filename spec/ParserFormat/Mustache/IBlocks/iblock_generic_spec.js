var testHelper = require('../../test_helpers');
var ErrorMessage = testHelper.ErrorMessage;
var customMatchers = testHelper.customMatchers;
var parser = testHelper.parser;

describe('iblock generic', function() {
    it('must have a legal name', function(){
        var template = '{{#if x}} x {{::then}} y {{/if}}';
        expect(function() {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockUnknownType('{{::then'));
    });

    it('must start with two : characters', function() {
        var template = '{{#if y}} x {{:else}} y {{/if}}';
        expect(function() {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockUnknownType('{{:else'));
    });

});