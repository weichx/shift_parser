var testHelper = require('../../test_helpers');
var ErrorMessage = testHelper.ErrorMessage;
var customMatchers = testHelper.customMatchers;
var parser = testHelper.parser;

describe('foreach block', function() {
    it('should be declarable', function() {
        var template = '{{#foreach item in array}} content {{/foreach}}';
        expect(function() {
            parser.parse(template);
        }).not.toThrow();
    });

    it('must declare a variable name', function() {
        var template = '{{#foreach in array}} content {{/foreach}}';
        expect(function() {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.foreachInvalidFormat(['in', 'array']));
    });

    it('must declare the in keyword', function() {
        var template = '{{#foreach item array}} content {{/foreach}}';
        expect(function() {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.foreachInvalidFormat(['item', 'array']));
    });

    it('must declare an array name', function() {
        var template = '{{#foreach item in}} content {{/foreach}}';
        expect(function() {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.foreachInvalidFormat(['item', 'in']));
    });

    it('must declare a different variableName and arrayName', function() {
        var template = '{{#foreach item in item}} content {{/foreach}}';
        expect(function() {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.foreachInvalidVariableArrayName());
    });

    it('must have a closed header', function () {
        var template = '{{#foreach item in array {{/foreach}}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.unmatchedOpenOrCloseMustache('foreach'));
    });

    it('must have a closing tag', function () {
        var template = '{{#foreach item in array}} content ';
        expect(function () {
            parser.parse(template);
        }).toThrow();
    });

    it('can have html children', function() {
        var template = '{{#foreach item in array}} <div id="repeat me"></div> {{/foreach}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can be inside of another foreach', function() {
        var template = '{{#foreach item in x}} <div id="showme">{{#foreach item in  z}} content {{/foreach}} </div> {{/foreach}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('does not need content', function() {
        var template = '{{#foreach item in x}}{{/foreach}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can have content before it', function() {
        var template = '<div>content{{#foreach item in x}}{{/foreach}}</div>';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can have content after it', function() {
        var template = '<div>content{{#foreach i in x}}{{/foreach}}content</div>';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });
});