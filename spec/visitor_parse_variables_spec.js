var Parser = require('../dest/Parser/Parser.js');
var ParserError = require('../dest/Parser/ParserError.js');

describe('Visitor Parsing Variables (no variable validation)', function () {

    it("parses a template with mustache variables in it", function (done) {
        var templateString = '<div id="someId">someText<span class="test">{{testvar}}moretext</span></div>';
        Parser.compileTemplateFromString(templateString, function (error, template) {
            expect(error).toBeUndefined();
            expect(template.blocks[0].elementDescriptors[0].variables[0]).toEqual('testvar');
            expect(template.blocks[0].elementDescriptorIndices[0]).toEqual(3);
            done();
        });
    });

    it("parses a template with badly spaced mustache variable in it", function (done) {
        var templateString = '<div id="someId">someText<span class="test">{{   testvar }}moretext</span></div>';
        Parser.compileTemplateFromString(templateString, function (error, template) {
            expect(error).toBeUndefined();
            expect(template.blocks[0].elementDescriptors[0].variables[0]).toEqual('testvar');
            done();
        });
    });

    it("parses a template with many mustache variables in it", function (done) {
        var templateString = '<div id="someId">{{var0}}someText{{var1}}<span class="test">{{   var2 }}moretext</span></div>';
        Parser.compileTemplateFromString(templateString, function (error, template) {
            expect(error).toBeUndefined();
            expect(template.blocks[0].elementDescriptorIndices.length).toEqual(2);
            expect(template.blocks[0].elementDescriptors[0].variables[0]).toEqual('var0');
            expect(template.blocks[0].elementDescriptors[0].variables[1]).toEqual('var1');
            expect(template.blocks[0].elementDescriptors[1].variables[0]).toEqual('var2');
            expect(template.blocks[0].elementDescriptors[0].content).toEqual(['', 'someText', '']);
            expect(template.blocks[0].elementDescriptors[1].content).toEqual(['', 'moretext']);
            done();
        });
    });

    it('builds content when encountering mustache variables', function (done) {
        var templateString = '<div id="someId">{{var0}}someText{{var1}}<span class="test">moretext</span></div>';
        Parser.compileTemplateFromString(templateString, function (error, template) {
            expect(error).toBeUndefined();
            expect(template.blocks[0].elementDescriptors[0].content).toEqual(['', 'someText', '']);
            done();
        });
    });


    it("parses a template with variable formatters", function (done) {
        var templateString = '<div id="someId">someText<span class="test">{{   testvar | formatter0 | formatter1(variant) }}moretext</span></div>';
        Parser.compileTemplateFromString(templateString, function (error, template) {
            expect(error).toBeUndefined();
            expect(template.blocks[0].elementDescriptors[0].variables[0]).toEqual(['0', 'testvar', 'formatter0', 'formatter1_variant']);
            done();
        });
    });

    it('places a % character in place of text element in html string when encountering a mustache variable', function (done) {
        var templateString = '<div id="someId">someText<span class="test">text{{testvar}}moretext</span></div>';
        Parser.compileTemplateFromString(templateString, function (error, template) {
            expect(error).toBeUndefined();
            expect(template.blocks[0].htmlString).toEqual('<div id="someId">someText<span class="test">%</span></div>');
            done();
        });
    });

    it('will not place a second % character in html string when encountering multiple mustache variables', function (done) {
        var templateString = '<div id="someId">someText<span class="test">text{{testvar}}moretext {{another }}</span></div>';
        Parser.compileTemplateFromString(templateString, function (error, template) {
            expect(error).toBeUndefined();
            expect(template.blocks[0].htmlString).toEqual('<div id="someId">someText<span class="test">%</span></div>');
            done();
        });
    });


    it('will throw an error if variable name is invalid', function (done) {
        var templateString = '<div id="someId">someText<span class="test">text{{not ok}}moretext {{another }}</span></div>';
        Parser.compileTemplateFromString(templateString, function (error, template) {
            expect(error).toBeDefined();
            expect(error.errorType).toEqual(ParserError.InvalidVariableName);
            done();
        });
    });

    it("will accept variable paths", function (done) {
        var templateString = '<div id="someId">someText{{myvar[i].fn[j].something}}<span class="test">stuff</span></div>';
        Parser.compileTemplateFromString(templateString, function (error, template) {
            expect(error).toBeUndefined();
            expect(template.blocks[0].elementDescriptors[0].variables[0]).toEqual(['myvar', 'i', 'fn', 'j', 'something']);
            done();
        });
    });

    it('should remove leading and trailing whitespace in content with variables', function(done) {
        var templateString = '<div id="someId">    someText{{variable}} moar content    <span class="test">stuff</span></div>';
        Parser.compileTemplateFromString(templateString, function (error, template) {
            expect(error).toBeUndefined();
            expect(template.blocks[0].elementDescriptors[0].content).toEqual(['someText', ' moar content']);
           done();
        });
    });
});