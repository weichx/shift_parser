var testHelper = require('../../test_helpers');
var parser = testHelper.parser;
var ErrorMessage = testHelper.ErrorMessage;

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

    //todo reenable after fixing compute blocks
    //it('allows template variables to have a compute block', function() {
    //    var template = '{{&template => (x) 1 + 1 * Math.Pi}}';
    //    expect(function () {
    //        parser.parse(template)
    //    }).not.toThrow();
    //});

});