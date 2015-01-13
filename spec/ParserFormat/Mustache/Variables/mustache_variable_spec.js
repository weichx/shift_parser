var testHelper = require('../../test_helpers');
var parser = testHelper.parser;
var ErrorMessage = testHelper.ErrorMessage;

describe('mustache variable', function () {
    it('allows mustache variables', function () {
        var template = 'content {{variable}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('allows root level mustache variables', function () {
        var template = '{{variable}} content';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('allows only mustache variables in the document', function () {
        var template = '{{variable}}';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it("allows mustache variables inside html", function () {
        var template = '<div> <div>{{variable}} </div> content </div>';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it("allows mustache variables inside attributes", function () {
        var template = '<div id="{{variable}}"></div> content';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it("allows mustache variables inside mustache blocks", function () {
        var template = '{{#unless false}} {{variable}} {{/unless}} content';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it("allows multiple mustache variables", function () {
        var template = '{{variable}}{{variable2}}{{Variable3}} content';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('ignores casing', function() {
        var template = '{{variable}}{{vaArIable2}}{{Variable3}} content';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    it('allows mustache variables with $ and _ in their names', function () {
        var template = '{{variable}}{{_vaArIable2}}{{_}}{{$}} content';
        expect(function () {
            parser.parse(template);
        }).not.toThrow();
    });

    //todo fix variable identifiers then re-enable this test
    //it('does not allow mustache variables with invalid names', function () {
    //    var template = '{{%variable}}{{@vaArIable2}}{{Variable3}} content';
    //    expect(function () {
    //        parser.parse(template);
    //    }).toThrow();
    //});

    it('cannot have a whitespace only name', function() {
        var template = '{{   }}';
        expect(function () {
            parser.parse(template);
        }).toThrowWithMessage(ErrorMessage.whitespaceVariableName());
    })
});