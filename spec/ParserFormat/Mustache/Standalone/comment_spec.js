var testHelper = require('../../test_helpers');
var ErrorMessage = testHelper.ErrorMessage;
var customMatchers = testHelper.customMatchers;
var parser = testHelper.parser;

beforeEach(function() {
    jasmine.addMatchers(customMatchers);
});
describe('comments', function() {
    it('allows a mustache comment', function() {
        var template = '{{!comment}}';
        expect(function () {
            parser.parse(template)
        }).not.toThrow();
    });

    //todo allow unmatched mustaches in comments
    //it('allows unmatched mustaches in comment', function() {
    //    var template = '{{!comment {{}}} }{{}}{}}}';
    //    expect(function () {
    //        parser.parse(template)
    //    }).not.toThrow();
    //});
});


