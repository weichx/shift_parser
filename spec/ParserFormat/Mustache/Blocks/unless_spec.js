var testHelper = require('../../test_helpers');
var parser = testHelper.parser;
var ErrorMessage = testHelper.ErrorMessage;

beforeEach(function () {
    jasmine.addMatchers(testHelper.customMatchers);
});

describe('Mustache unless blocks', function () {

    it('can have an expression', function () {
        var template = '{{#unless 1 + 1 == 2}} content {{/unless}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('must have an expression', function () {
        var template = '{{#unless }} content {{/unless}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.invalidBlockHeaderContent('unless', ''));
    });

    it('must have a closed header', function () {
        var template = '{{#unless x == 1 {{/unless}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.unmatchedOpenOrCloseMustache('unless'));
    });

    it('must have a closing tag', function () {
        var template = '{{#unless x == 1}} content ';
        expect(function () {
            parser.parse(template);
        }).toThrow();
    });

    it('can take a compute block', function () {
        var template = '{{#unless => x + 1 == 2}} content {{/unless}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can take a compute block with arguments', function () {
        var template = '{{#unless => (x, &y)  x + 1 == 2}} content {{/unless}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can take an else block', function () {
        var template = '{{#unless x}}c {{::else}}c {{/unless}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can take an else unless block', function () {
        var template = '{{#unless x}}c {{::elseif z}}c {{/unless}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can take an elseif and an else', function () {
        var template = '{{#unless x}}c {{::elseif z}}c {{::else}} z {{/unless}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can have html children', function() {
        var template = '{{#unless x}} <div id="showme"></div> {{/unless}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can be inside of another unless', function() {
        var template = '{{#unless x}} <div id="showme">{{#unless z}} content {{/unless}} </div> {{/unless}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('does not need content', function() {
        var template = '{{#unless x}}{{/unless}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('cannot have two else blocks', function() {
        var template = '{{#unless x}} {{::else}} {{::else}} {{/unless}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockForbiddenDuplicate('else', 'unless'));
    });

    it('can have many elseif blocks', function() {
        var template = '{{#unless x}} {{::elseif y}} {{::elseif z}} {{::elseif b}} {{::else}} {{/unless}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('cannot have an elseif after an else', function() {
        var template = '{{#unless x}} {{::elseif y}} {{::elseif z}} {{::else}} {{::elseif z}} {{/unless}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockWrongOrder('elseif', 'else', 'unless'));
    });

    it('can have content before it', function() {
        var template = '<div>content{{#unless x}}{{/unless}}</div>';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can have content after it', function() {
        var template = '<div>content{{#unless x}}{{/unless}}content</div>';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

});