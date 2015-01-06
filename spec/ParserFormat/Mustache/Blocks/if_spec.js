var testHelper = require('../../test_helpers');
var parser = testHelper.parser;
var ErrorMessage = testHelper.ErrorMessage;

beforeEach(function () {
    jasmine.addMatchers(testHelper.customMatchers);
});

describe('Mustache if blocks', function () {

    it('can have an expression', function () {
        var template = '{{#if 1 + 1 == 2}} content {{/if}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('must have an expression', function () {
        var template = '{{#if }} content {{/if}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.invalidBlockHeaderContent('if', ''));
    });

    it('must have a closed header', function () {
        var template = '{{#if x == 1 {{/if}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.unmatchedOpenOrCloseMustache('if'));
    });

    it('must have a closing tag', function () {
        var template = '{{#if x == 1}} content ';
        expect(function () {
            parser.parse(template);
        }).toThrow();
    });

    it('can take a compute block', function () {
        var template = '{{#if => x + 1 == 2}} content {{/if}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can take a compute block with arguments', function () {
        var template = '{{#if => (x, &y)  x + 1 == 2}} content {{/if}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can take an else block', function () {
        var template = '{{#if x}}c {{::else}}c {{/if}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can take an else if block', function () {
        var template = '{{#if x}}c {{::elseif z}}c {{/if}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can take an elseif and an else', function () {
        var template = '{{#if x}}c {{::elseif z}}c {{::else}} z {{/if}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can have html children', function() {
        var template = '{{#if x}} <div id="showme"></div> {{/if}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can be inside of another if', function() {
        var template = '{{#if x}} <div id="showme">{{#if z}} content {{/if}} </div> {{/if}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('does not need content', function() {
        var template = '{{#if x}}{{/if}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('cannot have two else blocks', function() {
        var template = '{{#if x}} {{::else}} {{::else}} {{/if}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockForbiddenDuplicate('else', 'if'));
    });

    it('can have many elseif blocks', function() {
        var template = '{{#if x}} {{::elseif y}} {{::elseif z}} {{::elseif b}} {{::else}} {{/if}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('cannot have an elseif after an else', function() {
        var template = '{{#if x}} {{::elseif y}} {{::elseif z}} {{::else}} {{::elseif z}} {{/if}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockWrongOrder('elseif', 'else', 'if'));
    });

    it('can have content before it', function() {
        var template = '<div>content{{#if x}}{{/if}}</div>';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can have content after it', function() {
        var template = '<div>content{{#if x}}{{/if}}content</div>';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

});