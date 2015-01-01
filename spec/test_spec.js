var Parser = require('../dest/Parser.js').ShiftTemplateParser;

describe("Basics", function() {
    it("Runs", function(){
        expect(true).toBe(true);
    });

    it("Find parser", function() {
        expect(new Parser()).toBeDefined();
    });
});

