var testHelper = require('../../test_helpers');
var ErrorMessage = testHelper.ErrorMessage;
var customMatchers = testHelper.customMatchers;
var parser = testHelper.parser;


describe('else intermediate block', function() {
    it('should exist happily as an if block child', function() {
        var template = '{{#if true}} {{::else}} {{/if}}';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('should exist happily as an unless block child', function() {
        var template = '{{#unless true}} {{::else}} {{/unless}}';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('is not required to not have children', function() {
        var template = '{{#unless true}} {{::else}} {{/unless}}';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('can have children', function() {
        var template = '{{#unless true}} {{::else}} content <div></div> {{/unless}}';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('should be the only else block on an if or unless', function() {
        var template = '{{#unless true}} {{::else}} {{::else}} <div></div> {{/unless}}';
        expect(function () {
            parser.parse(template)
        }).toThrowWithMessage(ErrorMessage.iBlockForbiddenDuplicate('else', 'unless'));
    });

    it('should not be in switch or foreach blocks', function() {
        var template = '{{#switch true}} {{::else}} {{/switch}}';
        expect(function () {
            parser.parse(template)
        }).toThrowWithMessage(ErrorMessage.iBlockNotAllowedHere('else', 'switch'));
        template = '{{#foreach item in array}} {{::else}} {{/foreach}}';
        expect(function () {
            parser.parse(template)
        }).toThrowWithMessage(ErrorMessage.iBlockNotAllowedHere('else', 'foreach'));
    });

    it('should not take content in its header', function() {
        var template = '{{#if true}} {{::else stuff}} {{/if}}';
        expect(function () {
            parser.parse(template)
        }).toThrowWithMessage(ErrorMessage.iBlockHeaderMustBeEmpty('else'));
    });

    it('should not care about spacing', function() {
        var template = '{{#if true}} {{ :: else }} {{/if}}';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('should be the last child in an if or unless block', function() {
        var template = '{{#if true}} {{ :: else }}  {{::elseif true}} {{/if}}';
        expect(function () {
            parser.parse(template)
        }).toThrowWithMessage(ErrorMessage.iBlockWrongOrder('elseif', 'else', 'if'));
    });


    it('cannot be overlapped by another block', function() {
        var template = '{{#if true}} {{#unless a}} {{/if}} {{/unless}}';
        expect(function() {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.mustacheBlockNotClosed('unless', 'if'));
    });

    it('is case insensitive', function(){
        var template = '{{#if y}} x {{::ElSe}} y{{/if}}';
        expect(function() {
            parser.parse(template);
        }).not.toThrow();
    });

    it('cannot be overlapped by html', function() {
        var template = '{{#if true}} <div> {{::else}} </div> {{/if}}';
        expect(function() {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockNotAllowedHere('else', 'an html element (div)'));
    });

    it('cannot take a compute block', function() {
        //todo implement after compute block arguments are working right
    });
});