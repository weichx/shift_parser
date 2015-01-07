var testHelper = require('../../test_helpers');
var ErrorMessage = testHelper.ErrorMessage;
var customMatchers = testHelper.customMatchers;
var parser = testHelper.parser;

describe('switch block', function () {

    it('can take an expression', function () {
        var template = '{{#switch x * 5}} {{::case 0}} c{{/switch}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('must take an expression', function () {
        var template = '{{#switch }} {{::case 0}} c{{/switch}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.invalidBlockHeaderContent('switch', ''));
    });

    it('can take a compute block', function () {
        var template = '{{#switch => (a, &b) x + 5 }} {{::case 0}} c{{/switch}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can optionally have no children', function () {
        var template = '{{#switch x * 5}} {{/switch}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can have case children', function () {
        var template = '{{#switch x * 5}} {{::case 0}} x {{::case 1}} c{{/switch}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can have case and default children', function () {
        var template = '{{#switch x * 5}} {{::case 0}} x {{::case 1}} z {{::default}} c{{/switch}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can have optionally only a default child', function () {
        var template = '{{#switch x * 5}} {{::default}} c{{/switch}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can have only one default child', function () {
        var template = '{{#switch x * 5}} {{::default}} {{::default}} c{{/switch}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockForbiddenDuplicate('default', 'switch'));
    });

    it('can not have a case after a default', function () {
        var template = '{{#switch x * 5}} {{::default}} {{::case x}} c{{/switch}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockWrongOrder('case', 'default', 'switch'));
    });

    it('cannot have content between header block and first child', function() {
        var template = '{{#switch x * 5}} illegal {{::default}} c{{/switch}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.illegalSwitchContent());
    });

    it('can nest a switch inside of a switch', function() {
        var template = '{{#switch x * 5}} {{::default}} {{#switch z}} {{::case 10}} {{/switch}} {{/switch}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can have a default of its own and a child switch can have a default', function() {
        var template = '{{#switch x * 5}} {{::default}} {{#switch z}} {{::default}} {{/switch}} {{/switch}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });




});