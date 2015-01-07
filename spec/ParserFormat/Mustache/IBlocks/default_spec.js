var testHelper = require('../../test_helpers');
var ErrorMessage = testHelper.ErrorMessage;
var customMatchers = testHelper.customMatchers;
var parser = testHelper.parser;

describe('default intermediate block', function () {
    it('can be declared', function () {
        var template = '{{#switch z}} {{::default}} x {{/switch}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('must not have an expression', function () {
        var template = '{{#switch z}} {{::default z}} x {{/switch}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockHeaderMustBeEmpty('default'));
    });

    it('cannot be a child on the root block', function () {
        var template = '';
        //expect(function () {
        try {
            parser.parse('{{::default}}');
        } catch(e) {
            console.log(e);
        }
       // }).toThrowWithMessage(ErrorMessage.iBlockNotAllowedHere('default', 'the template root'));
    });

    it('must be the last child of switch', function () {
        var template = '{{#switch z}} {{::default }} x {{::case x}} {{/switch}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockWrongOrder('case', 'default', 'switch'));
    });

    it('should not care about spacing', function () {
        var template = '{{#switch z}} {{::   default \n}} x {{/switch}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('should not be allowed in if blocks', function () {
        var template = '{{#if z}} {{::default }}  {{/if}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockNotAllowedHere('default', 'if'));
    });

    it('should not be allowed in foreach blocks', function () {
        var template = '{{#foreach z >> index:i}} {{::default }} {{/foreach}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockNotAllowedHere('default', 'foreach'));
    });

    it('should not be allowed in unless blocks', function () {
        var template = '{{#unless z}} {{::default }} x{{/unless}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockNotAllowedHere('default', 'unless'));
    });

    it('is not required to have children', function () {

    });

    it('can have children', function () {

    });

    it('cannot be overlapped by another block', function () {

    });

    it('cannot be overlapped by html', function () {

    });

    it('is case insensitive', function () {
        var template = '{{#switch y}}  {{::DEFault}} y{{/switch}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });
});