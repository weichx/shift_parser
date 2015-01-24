var testHelper = require('../../test_helpers');
var ErrorMessage = testHelper.ErrorMessage;
var customMatchers = testHelper.customMatchers;
var parser = testHelper.parser;

describe('elseif intermediate block', function() {
    it('can be declared', function() {
        var template = '{{#unless 10}} {{::elseif 11}} {{/unless}}';
        expect(function() {
            parser.parse(template);
        }).not.toThrow();
    });

    it('must have an expression', function() {
        var template = '{{#unless 10}} {{::elseif }} {{/unless}}';
        expect(function() {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockHeaderCannotBeEmpty('elseif'));
    });

    it('can be a child of if', function() {
        var template = '{{#if 10}} {{::elseif 11}} {{/if}}';
        expect(function() {
            parser.parse(template);
        }).not.toThrow();
    });
    
    it('can be a child of unless', function() {
        var template = '{{#unless 10}} {{::elseif 11}} {{/unless}}';
        expect(function() {
            parser.parse(template);
        }).not.toThrow();
    })
    
    it('cannot be a child of foreach', function() {
        var template = '{{#foreach item in array}} {{::elseif 11}} {{/foreach}}';
        expect(function() {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockNotAllowedHere('elseif', 'foreach'));
    });
    
    it('cannot be a child of switch', function() {
        var template = '{{#switch i}} {{::elseif 11}} {{/switch}}';
        expect(function() {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockNotAllowedHere('elseif', 'switch'));
    });

    it('can be the last child of unless', function() {
        var template = '{{#unless 10}} {{::elseif 11}} {{::elseif 12}} {{/unless}}';
        expect(function() {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can be the last child of if', function() {
        var template = '{{#if 10}} {{::elseif 11}} {{::elseif 12}} {{/if}}';
        expect(function() {
            parser.parse(template);
        }).not.toThrow();
    });

    it('should not care about spacing', function() {
        var template = '{{#if 10}} {{  :: elseif   11}} {{\n::elseif 12}} {{/if}}';
        expect(function() {
            parser.parse(template);
        }).not.toThrow();
    });


    it('is not required to have children', function() {
        var template = '{{#if 10}} {{::elseif 11}} {{::elseif 12}} {{/if}}';
        expect(function() {
            parser.parse(template);
        }).not.toThrow();
    });

    it('can have children', function() {
        var template = '{{#if 10}} {{::elseif   11}} xxxxx {{::elseif 12}}<div id="someid"></div> {{/if}}';
        expect(function() {
            parser.parse(template);
        }).not.toThrow();
    });

    it('cannot be overlapped by another block', function() {
        var template = '{{#if 10}} {{::elseif 11}} {{#switch z}} {{::elseif 12}} {{/switch}} {{/if}}';
        expect(function() {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockNotAllowedHere('elseif', 'switch'));
    });

    it('cannot be overlapped by html', function() {
        var template = '{{#if 10}} {{::elseif 11}} <span> {{::elseif 12}} </span> {{/if}}';
        expect(function() {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.iBlockNotAllowedHere('elseif', 'an html element (span)'));
    });

    //todo implement
    //it('can take a compute block', function() {
    //    var template = '{{#if 10}} {{::elseif => () 1 + 1}} yy {{/if}}';
    //    expect(function() {
    //        parser.parse(template);
    //    }).not.toThrow();
    //});

    it('is case insensitive', function(){
        var template = '{{#if y}} x {{::ElSeIf z}} y{{/if}}';
        expect(function() {
            parser.parse(template);
        }).not.toThrow();
    });
});