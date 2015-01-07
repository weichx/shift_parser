var testHelper = require('./test_helpers');
var ErrorMessage = testHelper.ErrorMessage;
var customMatchers = testHelper.customMatchers;
var parser = testHelper.parser;

beforeEach(function() {
    jasmine.addMatchers(customMatchers);
});


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
        }).toThrow(); //todo throw the right error
    });

    it('requires html tags to be have a matching close tag', function () {
        var template = '<div></span>';
        expect(function () {
            parser.parse(template)
        }).toThrow(); //todo throw the right error
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
});

