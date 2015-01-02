var NodeHTMLParser = <NodeHTMLParserType>require('htmlparser');
var HTMLParser = NodeHTMLParser.Parser;
var Handler = NodeHTMLParser.DefaultHandler;
var fs = require('fs');

import Visitor = require('./Visitor');
import Block = require('./../Structures/Block');

class ShiftTemplateParser {
    private static handlerOptions = {ignoreWhitespace : true};

    public  static compileTemplateFromString(templateString : string, callback : (err, template) => void ) : void {
        var templateContent = ShiftTemplateParser.escapeTemplate(templateString);
        var handler = new Handler(function (error, ast : Array<ASTNode>) {
            if (error) {
                callback(error, undefined);
            } else {
                try {
                    var template = Visitor.constructTemplate(ast);
                    callback(undefined, template);
                } catch (ex) {
                    callback(ex, undefined);
                }
            }
        }, ShiftTemplateParser.handlerOptions);
        var htmlParser = new HTMLParser(handler);
        htmlParser.parseComplete(templateContent);
    }

    public static compileTemplateFromFile(templatePath : string, callback : (err, template) => void) {
        fs.readFile(templatePath, 'utf-8', function (err, fileContents) {
            if (err) {
                console.log(err);
                callback(err, undefined);
            } else {
               ShiftTemplateParser.compileTemplateFromString(fileContents, callback);
            }
        });
    }

    private static escapeTemplate(templateString : string) : string {
        return templateString.replace(/\{\{.*?\}\}/g, function (match) {
            return match.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        });
    }
}

export = ShiftTemplateParser;