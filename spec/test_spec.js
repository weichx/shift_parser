var Parser = require('../dest/Parser/Parser.js');

describe("Basics", function () {
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

    it('removes new lines from template', function() {

    });

    it("parses a template with mustache variables in it", function(done) {
        var templateString = '<div id="someId">someText<span class="test">{{testvar}}moretext</span></div>';
        Parser.compileTemplateFromString(templateString, function (error, template) {
            expect(error).toBeUndefined();
            expect(template.blocks[0].elementDescriptors[0].variables[0]).toEqual('testvar');
            done();
        });
    });
});

