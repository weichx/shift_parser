var Parser = require('../dest/Parser/Parser.js');
var ParserError = require('../dest/Parser/ParserError.js');

describe("Visitor plain html parsing", function () {
    it("Runs", function () {
        expect(true).toBe(true);
    });

    it("Find parser", function () {
        expect(new Parser()).toBeDefined();
    });

    it("parses a plain html template without text", function (done) {
        var templateString = '<div id="0"></div><span><ul><li></li></ul></span>';
        Parser.compileTemplateFromString(templateString, function (error, template) {
            expect(error).toBeUndefined();
            expect(template.blocks[0].htmlString).toEqual(templateString);
            done();
        });
    });

    it("parses a plain html template with a self closing tag", function (done) {
        var templateString = '<div></div><br/>';
        Parser.compileTemplateFromString(templateString, function (error, template) {
            expect(error).toBeUndefined();
            expect(template.blocks[0].htmlString).toEqual(templateString);
            done();
        });
    });

    it("parses a plain html template with text in it", function (done) {
        var templateString = '<div id="someId">someText<span class="test">moretext</span></div>';
        Parser.compileTemplateFromString(templateString, function (error, template) {
            expect(error).toBeUndefined();
            expect(template.blocks[0].htmlString).toEqual(templateString);
            done();
        });
    });

    it('removes newlines from regular content', function (done) {
        var templateString = '<div>\nsome content\n\n<span>\nmore\ncontent</span></div>';
        Parser.compileTemplateFromString(templateString, function (error, template) {
            expect(error).toBeUndefined();
            expect(template.blocks[0].htmlString).toEqual('<div>some content<span>more content</span></div>');
            done();
        });
    });

    it("removes leading and trailing space from regular text elements", function(done) {
        var templateString = '<div>    some content   <span> more content  </span></div>';
        Parser.compileTemplateFromString(templateString, function (error, template) {
            expect(error).toBeUndefined();
            expect(template.blocks[0].htmlString).toEqual('<div>some content<span>more content</span></div>');
            done();
        });
    });
});

describe("Block / Element Descriptors: ", function() {
    it("Should correctly count the elements", function(done) {
        var templateString = "<div>content<span>{{var0}}</span></div>";
        Parser.compileTemplateFromString(templateString, function (error, template) {
            expect(error).toBeUndefined();
            expect(template.blocks[0].elementCount).toEqual(3);
            done();
        });
    });

    it("Should correctly gather element descriptors", function (done) {
        var templateString = "<div>content{{var1}}<span>{{var0}} content</span></div>";
        Parser.compileTemplateFromString(templateString, function (error, template) {
            expect(error).toBeUndefined();
            expect(template.blocks[0].elementCount).toEqual(3);
            expect(template.blocks[0].elementDescriptors.length).toEqual(2);
            expect(template.blocks[0].elementDescriptorIndices.length).toEqual(2);
            expect(template.blocks[0].elementDescriptorIndices[0]).toEqual(1);
            expect(template.blocks[0].elementDescriptorIndices[1]).toEqual(3);
            done();
        });
    })
});



describe('Parser intermediate', function () {


    it('removes new lines from interpolated elements', function () {

    });
});

