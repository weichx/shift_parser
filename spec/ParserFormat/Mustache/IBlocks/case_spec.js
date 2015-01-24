var testHelper = require('../../test_helpers');
var ErrorMessage = testHelper.ErrorMessage;
var customMatchers = testHelper.customMatchers;
var parser = testHelper.parser;

describe('case intermediate block', function () {
    it('can be declared', function () {
        var template = '{{#switch true}} {{::case 1}} {{/switch}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('must have an expression', function () {
        var template = '{{#switch true}} {{::case}} {{/switch}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockHeaderCannotBeEmpty('case'));
    });

    it('cannot be child of if', function () {
        var template = '{{#if true}} {{::case 0}} {{/else}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockNotAllowedHere('case', 'if'));
    });

    it('cannot be child of unless', function () {
        var template = '{{#unless true}} {{::case 0}} {{/else}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockNotAllowedHere('case', 'unless'));
    });

    it('cannot be child of foreach', function () {
        var template = '{{#foreach item in array}} {{::case 0}} {{/foreach}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockNotAllowedHere('case', 'foreach'));
    });

    it('can be the last child of switch', function () {
        var template = '{{#switch true}} {{::case 0}} {{::case 1}} {{/switch}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('should not care about spacing', function () {
        var template = '{{#switch true}} {{::  case 0}} {{::case 1}} {{/switch}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('is not required to have children', function () {
        var template = '{{#switch true}} {{::  case 0}} {{/switch}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can have children', function () {
        var template = '{{#switch true}} {{::case 0}} <div id="1"></div> {{/switch}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('cannot be overlapped by another block', function () {
        var template = '{{#switch true}} {{#if true}} {{::case 0}} {{/switch}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockNotAllowedHere('case', 'if'));
    });

    it('cannot be overlapped by html', function () {
        var template = '{{#switch true}} <div> {{::case 0}} </div> {{/switch}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockNotAllowedHere('case', 'an html element (div)'));
    });

    //todo implement
    //it('cannot take a complex expression', function() {
    //
    //});
    //todo implement
    //it('cannot take a compute block', function () {
    //    var template = '{{#switch true}} {{::case => x + 1}} x {{/switch}}';
    //    expect(function () {
    //        parser.parse(template);
    //    }).toThrowWithMessage(ErrorMessage.computeBlockNotAllowedHere('case'));
    //});

    it('can take a string literal', function () {
        var template = '{{#switch true}} {{::case \'string literal\'}} x {{/switch}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can take a boolean literal', function () {
        var template = '{{#switch true}} {{::case true}} x {{::case false}} {{/switch}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can take a number literal', function () {
        var template = '{{#switch true}} {{::case 1000}} {{/switch}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('is case insensitive', function () {
        var template = '{{#switch y}}  {{::CaSe 1}} y{{/switch}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });
});

