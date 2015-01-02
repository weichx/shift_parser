var Util = require('../dest/Parser/Util');

describe('Util', function() {
    it("should be defined", function() {
        expect(Util).toBeDefined();
    });

    it("should remove new lines", function() {
        var str = "hi\nhi\n\nhi";
        expect(Util.removeNewLines(str)).toEqual('hihihi');
    });

    it('should split on mustaches', function() {
        var str = "hi {{hello}} hi{{blah}}";
        expect(Util.splitOnMustaches(str)).toEqual(['hi ', 'hello', ' hi', 'blah', '']);
    });

    it('should indicate a string contains mustaches', function() {
        var str = 'stuff{{stuff}}';
        expect(Util.containsMustaches(str)).toBe(true);
    });

    it("should indicate a string is only whitespace", function() {
        expect(Util.isOnlyWhitespace("\n\t  \n")).toBeTruthy();
    });

    it('should convert [] to .', function() {
        var str = "x[i].fn()[0].call";
        expect(Util.convertBracketsToDots(str)).toEqual("x.i.fn().0.call");
    });

    it("should indicate a string contains a formatter", function() {
        expect(Util.containsFormatter('variable | formatter(variant)')).toBeTruthy();
    });

    it("should extract mustache names", function() {
        var name0 = '#block';
        var name1 = '::intermediateBlock adf';
        var name2 = '/blockClose dfa';
        var name3 = '&injectedVariable fdaf';
        var name4 = 'regularvariable';
        var name5 = '  #block';
        var name6 = ':: tricky';
        var name7 = ' regular';
        var name8 = '\nnewline';
        var name9 = '\t\tdoubletab\n';
        expect(Util.extractMustacheName(name0)).toEqual('block');
        expect(Util.extractMustacheName(name1)).toEqual('intermediateBlock');
        expect(Util.extractMustacheName(name2)).toEqual('blockClose');
        expect(Util.extractMustacheName(name3)).toEqual('injectedVariable');
        expect(Util.extractMustacheName(name4)).toEqual('regularvariable');
        expect(Util.extractMustacheName(name5)).toEqual('block');
        expect(Util.extractMustacheName(name6)).toEqual('tricky');
        expect(Util.extractMustacheName(name7)).toEqual('regular');
        expect(Util.extractMustacheName(name8)).toEqual('newline');
        expect(Util.extractMustacheName(name9)).toEqual('doubletab');
    });

    it("should extract a formatter chain", function() {
        var mustache = "variablename | formatter0( variant ) |formatter1   (variant) | formatter2";
        expect(Util.extractFormatterChain(mustache)).toEqual(['formatter0_variant', 'formatter1_variant', 'formatter2']);
    });

    it('validates variable names', function() {
        var name0 = 'legal';
        var name1 = ' legal ';
        var name2 = '\t\t\n legal';
        var name3 = '5nope';
        var name4 = 'not ok';
        var name5 = '$legal';
        var name6 = '_legal';
        expect(Util.isValidVariableName(name0)).toBeTruthy();
        expect(Util.isValidVariableName(name1)).toBeTruthy();
        expect(Util.isValidVariableName(name2)).toBeTruthy();
        expect(Util.isValidVariableName(name3)).toBeFalsy();
        expect(Util.isValidVariableName(name4)).toBeFalsy();
        expect(Util.isValidVariableName(name5)).toBeTruthy();
        expect(Util.isValidVariableName(name6)).toBeTruthy();


    });
});