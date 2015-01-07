var fs = require('fs');
var peg = require('pegjs');
var parserSrc = fs.readFileSync('PegParser.pegjs').toString();
var parser = peg.buildParser(parserSrc);
var errorMessages = require('../../Peg/ErrorMessages');

var removeLineCol = function(str) {
    var index = str.lastIndexOf(' Line');
    if(index !== -1) {
        return str.substring(0, index);
    } else {
        return str;
    }
};

var customMatchers = {
    toThrowWithMessage: function(util, customEqualityTesters) {
        return {
            compare: function(actual, expected) {
                if(expected === undefined) {
                    expected = '';
                }

                var result = {};
                try {
                    actual();
                } catch (e) {
                    var exMessage = removeLineCol(e.message);
                    result.pass = exMessage === expected;
                }
                if(result.pass) {
                    result.message = 'passed';
                } else {
                    result.message = 'Expected `' + exMessage + '` to equal `' + expected + '`';
                }
                return result;
            }
        }
    }

};

module.exports = {
    parser: parser,
    ErrorMessage: errorMessages,
    customMatchers: customMatchers,
    rebuiltParser: function() { return peg.buildParser(parserSrc) }
};