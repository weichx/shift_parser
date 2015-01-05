var fs = require('fs');
var peg = require('pegjs');
var parserSrc = fs.readFileSync('PegParser.pegjs').toString();
var parser = peg.buildParser(parserSrc);

describe('PegParser', function () {
    it('can handle an empty document', function () {
        var template = '';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('can handle a document with only content', function () {
        var template = 'string';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('can handle a document with only html', function () {
        var template = '<div></div>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('can handle a document with only mustaches', function () {
        var template = '{{v}}';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('requires html open tags to be closed', function () {
        var template = '<div';
        expect(function () {
            parser.parse(template)
        }).toThrow();
    });

    it('requires html tags to be have a matching close tag', function () {
        var template = '<div></span>';
        expect(function () {
            parser.parse(template)
        }).toThrow();
    });

    it('allows mustaches first', function () {
        var template = '{{stash}}<div id="someId"></div>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('allows content first', function () {
        var template = 'content<div id="someId"></div>{{stash}}';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('allows html first', function () {
        var template = '<div id="someId"></div>{{stash}}';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    describe('HTML children', function () {
        it('allows html to have children, starting with content', function () {
            var template = '<html>dont blow up{{stash}}</html>';
            expect(function() {
                parser.parse(template);
            }).not.toThrow();
        });

        it('allows html to have children, starting with a mustache', function () {
            var template = '<html>{{stash}}dont blow up <div></div></html>';
            expect(function() {
                parser.parse(template);
            }).not.toThrow();
        });

        it('allows html to have chidren, starting with html', function () {
            var template = '<html><div></div>dont blow up{{stash}}</html>';
            expect(function() {
                parser.parse(template);
            }).not.toThrow();
        });
    });
    describe('HTML attributes', function () {
        it('allows html open tags to have attributes', function () {
            var template = '<div id="someId"></div>';
            expect(function () {
                parser.parse(template)
            }).not.toThrow();
        });

        it('does not allow html close tags to have attributes', function () {
            var template = '<div></div id="someId>';
            expect(function () {
                parser.parse(template)
            }).toThrow();
        });

        it('requires attributes to be inside quotes', function () {
            var template = '<div id=someId></div>';
            expect(function () {
                parser.parse(template)
            }).toThrow();
            template = '<div id="someId"></div>';
            expect(function () {
                parser.parse(template)
            }).not.toThrow();
            template = "<div id='someid'></div>";
            expect(function () {
                parser.parse(template)
            }).not.toThrow();
        });

        it("allows mustache variables as attributes", function () {
            var template = "<div id='{{someid}}'></div>";
            expect(function () {
                parser.parse(template)
            }).not.toThrow();
        });

        it('will allow nested object literals in an attribute', function() {
            var template = "<div id='{v:{someid}}'></div>";
            expect(function () {
                parser.parse(template)
            }).not.toThrow();
        });

        it('allows formatters inside mustache variables when used as attributes', function() {

        });

    });

    it('requires html tags to be closed', function () {
        var template = '<div>';
        expect(function () {
            parser.parse(template)
        }).toThrow();
    });

    it('requires mustaches to be closed', function () {
        var template = '{{notclosed';
        expect(function () {
            parser.parse(template)
        }).toThrow();
    });

    it('allows html tags to be self closing', function() {
        var template = '<html><input/><br/></html>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('allows self closed html tags to have attributes', function() {
        var template = '<html><input id="something"/><br/></html>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('allows self closed html tags to have mustache attributes', function() {
        var template = '<html><input attr="{{something}}"/><br/></html>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('can handle multiple html elements', function () {
        var template = 'content  <div>  </div><span>\n<br/></span>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('can handle nested html elements', function () {
        var template = '<div><div></div></div>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('can handle spacing between html elements', function () {
        var template = '<div>\n\t <div>\n   </div></div>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    it('can handle new lines between html elements', function () {
        var template = '<div>\n\t <div>\n   </div></div>';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    describe('Generic Mustache', function () {
        it('should not handle unsupported mustache types', function () {
            var template = 'content {{[]}}';
            expect(function () {
                parser.parse(template)
            }).toThrow();
        });

    });

    describe('Variable formatters', function () {
        it('can handle mustache variables with formatters', function () {
            var template = 'content {{variable | curreny(dollar) }} <div>  content {{v |c}} </div>';
            expect(function () {
                parser.parse(template)
            }).not.toThrow();
        });

        it('does not require formatters to have variants', function () {
            var template = 'content {{variable}} <div></div>';
            expect(function () {
                parser.parse(template)
            }).not.toThrow();
        });

        it('does not allow multiple variants in formatters', function () {
            var template = 'content {{variable | f(c d)}} <div></div>';
            expect(function () {
                parser.parse(template)
            }).toThrow();
        });

        it('allows a variable to have multiple formatters', function () {
            var template = 'content {{variable | f(c) | d(c) | o(b) }} <div></div>';
            expect(function () {
                parser.parse(template)
            }).not.toThrow();
        });

        it('disallows invalid variable names to formatters', function () {
            var template = 'content {{variable | f(%%) | d(c) | o(b) }} <div></div>';
            expect(function () {
                parser.parse(template)
            }).toThrow();
        });
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
            }).toThrow();
        });

        it("will allow mustaches inside of a block so long as they are from js and are matched", function() {
            var template = '<div>{{#if v = {x: {}}; }}{{/  if  }}</div>';
            expect(function () {
                parser.parse(template)
            }).not.toThrow();
        });

        it("will allow unmatched mustaches inside a block if they are part of a string", function() {
            var template = '<div>{{#if "}" v = {x: {}}; }}{{/  if  }}</div>';
            expect(function () {
                parser.parse(template)
            }).not.toThrow();
        });

        it('will allow html inside of mustache block header (if not in string the runtime will throw an error, not handled in parser)', function() {
            var template = '<div>{{#if "}" <div></div>v = {x: {}}; }}{{/  if  }}</div>';
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
        })
    });

    describe('comments', function() {
        it('allows a mustache comment', function() {
            var template = '{{!comment}}';
            expect(function () {
                parser.parse(template)
            }).not.toThrow();
        });
    });

    describe('template variables', function() {
        it('allow template variable symbols', function () {
            var template = '{{&template}}';
            expect(function () {
                parser.parse(template)
            }).not.toThrow();
        });

        it('allows template variables to have formatters', function() {
            var template = '{{&template | formatMe |formatMe(thisway)}}';
            expect(function () {
                parser.parse(template)
            }).not.toThrow();
        });

        //it('allows template variables to have a compute block', function() {
        //
        //});
        
    });
    
    describe('interface declarations', function() {
        it('allows for interface declaration nodes', function() {
            var template = '{{>> str : string; }}';
            expect(function () {
                parser.parse(template)
            }).not.toThrow();
        })
    });

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
            }).toThrow();
        });

        it('should not be in switch or foreach blocks', function() {
            var template = '{{#switch true}} {{::else}} {{/switch}}';
            expect(function () {
                parser.parse(template)
            }).toThrow();
            var template = '{{#foreach array >> index:i}} {{::else}} {{/foreach}}';
            expect(function () {
                parser.parse(template)
            }).toThrow();
        });

        it('should not take content in its header', function() {
            var template = '{{#if true}} {{::else stuff}} {{/if}}';
            expect(function () {
                parser.parse(template)
            }).toThrow();
        });

        it('should not care about spacing', function() {
            var template = '{{#if true}} {{ :: else }} {{/if}}';
            expect(function () {
                parser.parse(template)
            }).not.toThrow();
        });

        it('should be the last child in an if or unless block', function() {
            var template = '{{#if true}} {{ :: else }}  {{::elseif}} {{/if}}';
            expect(function () {
                parser.parse(template)
            }).toThrow();
        });
    });

    describe('elseif intermediate block', function() {
       it('can be declared', function() {

       });

        it('must have an expression', function() {

        });

        it('must be a child of if or unless', function() {

        });

        it('can be the last child of if or unless', function() {

        });

        it('should not care about spacing', function() {

        });

        it('should not be allowed in switch or foreach blocks', function() {

        });

        it('is not required to have children', function() {

        });
    });

    describe('case intermediate block', function() {
        it('can be declared', function() {

        });

        it('must have an expression', function() {

        });

        it('must be a child of switch', function() {

        });

        it('can be the last child of switch', function() {

        });

        it('should not care about spacing', function() {

        });

        it('should not be allowed in if, unless or foreach blocks', function() {

        });

        it('is not required to have children', function() {

        });
    });

    describe('default intermediate block', function() {
        it('can be declared', function() {

        });

        it('must not have an expression', function() {

        });

        it('must be a child of switch', function() {

        });

        it('must be the last child of switch', function() {

        });

        it('should not care about spacing', function() {

        });

        it('should not be allowed in if, unless or foreach blocks', function() {

        });

        it('is not required to have children', function() {

        });
    });
});
