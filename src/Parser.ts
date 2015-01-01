interface NodeHTMLParserType {
    Parser : any;
    DefaultHandler : any;
}

var NodeHTMLParser = <NodeHTMLParserType>require('htmlparser');
var HTMLParser = NodeHTMLParser.Parser;
var Handler = NodeHTMLParser.DefaultHandler;
var fs = require('fs');

import Block = require('./Block');

var MUSTACHE_REGEX = /{{(.*?)}}/;

export class ShiftTemplateParser {
    private static handlerOptions = {ignoreWhitespace : true};
    private static handlerFn = function(error, ast) {
        if(error) {
            console.log(error);
        } else {
            var parser = new ShiftTemplateParser(ast);
            parser.parse();
        }
    };
    private static handler = new Handler(ShiftTemplateParser.handlerFn, ShiftTemplateParser.handlerOptions);
    private static htmlParser = new HTMLParser(ShiftTemplateParser.handler);

    constructor(ast : Object) {

    }

    public static compileTemplate(templatePath : string) {
        var handler = new Handler(ShiftTemplateParser.handlerFn, ShiftTemplateParser.handlerOptions);
        fs.readFile(templatePath, 'utf-8', function (err, fileContents) {
            var templateContent = ShiftTemplateParser.escapeTemplate(fileContents);
            ShiftTemplateParser.htmlParser.parseComplete(templateContent);
        });
    }

    private parse() : void {

    }

    private handlerFunction() {

    }

    private static escapeTemplate(templateString : string) : string {
        return templateString.replace(/\{\{.*?\}\}/g, function (match) {
            return match.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        });
    }
}