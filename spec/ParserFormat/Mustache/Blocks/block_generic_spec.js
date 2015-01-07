var testHelper = require('../../test_helpers');
var parser = testHelper.parser;
var ErrorMessage = testHelper.ErrorMessage;

beforeEach(function () {
    jasmine.addMatchers(testHelper.customMatchers);
});

describe('MustacheBlocks', function() {
    it("does not allow an empty mustache block", function() {
        var template = '{{#if}}{{/if}}';
        expect(function () {
            parser.parse(template)
        }).toThrow();
    });

    it('allows a mustache block at the root', function() {
        var template = '{{#if true}}{{/if}}';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('allows a mustache block at the end', function() {
        var template = 'content{{#if true}}{{/if}}';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('allows a mustache block inside html', function() {
        var template = '<div>{{#if true}}{{/if}}</div>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('allows a mustache block inside a mustache block', function() {
        var template = '{{#if true}}{{#if true}}{{/if}}{{/if}}';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('allows content inside a mustache block ', function() {
        var template = '<div>{{#if true}}content{{/if}}</div>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('allows content before and after a mustache block', function() {
        var template = '<div>content{{#if true}}content{{/if}}content</div>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('allows html before and after a mustache block', function() {
        var template = '<div><div></div>content{{#if true}}content{{/if}}<div></div></div>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('requires a mustache block to be closed', function() {
        var template = '<div>{{#if true}}</div>';
        expect(function () {
            parser.parse(template)
        }).toThrow();
    });

    it('does not require whitespace in a mustache closing block', function() {
        var template = '<div>{{#if true}}{{/  if  }}</div>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('allows whitespace after the # and before the block name', function() {
        var template = '<div>{{# if true}}{{/  if  }}</div>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('does not allow unclosed html tags inside a mustache block', function() {
        var template = '<div>{{#if true}}</div>{{/  if  }}';
        expect(function () {
            parser.parse(template)
        }).toThrow();
    });

    it('does not allow unopened html tags inside a mustache block', function() {
        var template = '{{#if true}}</div>{{/  if  }}';
        expect(function () {
            parser.parse(template)
        }).toThrow();
    });

    it('will allow all valid mustache block types', function() {
        var template = '{{#if true}} {{/if}} {{#unless true}} {{/unless}} {{#switch true}}{{/switch}} {{#foreach array >> index:i}}{{/foreach}}';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('will not allow invalid mustache block types', function() {
        var template = '<div>{{#notvalid true}}{{/  if  }}</div>';
        expect(function () {
            parser.parse(template)
        }).toThrowWithMessage(ErrorMessage.mustacheBlockTypeUnknown('notvalid'));
    });

    it('will not allow invalid mustache block types without space', function() {
        var template = '<div>{{#notvalid }}{{/  if  }}</div>';
        expect(function () {
            parser.parse(template)
        }).toThrowWithMessage(ErrorMessage.mustacheBlockTypeUnknown('notvalid'));
    });

    it('will not allow invalid mustache block types with space', function() {
        var template = '<div>{{#notvalid}}{{/  if  }}</div>';
        expect(function () {
            parser.parse(template)
        }).toThrowWithMessage(ErrorMessage.mustacheBlockTypeUnknown('notvalid'));
    });

    it("will allow mustaches inside of a block so long as they are from js and are matched", function() {
        var template = '<div>{{#if v = {x: {}}; }}{{/  if  }}</div>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it("will allow unmatched mustaches inside a block if they are part of a string", function() {
        var template = '<div>{{#if z = "}"; v = {x: {}}; }} {{/  if  }}</div>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('will allow html inside of mustache block header (if not in string the runtime will throw an error, not handled in parser)', function() {
        var template = '<div>{{#if "<div></div>"; v = {x: {}}; }}{{/  if  }}</div>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('will not allow mustache blocks to overlap', function() {
        var template = '{{#unless true}} {{#switch true }} {{/unless}} {{/switch}}';
        expect(function() {
            parser.parse(template);
        }).toThrow();
    });

    it('will not allow unopened blocks', function() {
        var template = '{{/if}}';
        expect(function() {
            parser.parse(template);
        }).toThrow();
    });

    describe('Generic Mustache', function () {
        it('should not handle unsupported mustache types', function () {
            var template = 'content {{[]}}';
            expect(function () {
                parser.parse(template)
            }).toThrow();
        });

    });
});