import Block = require('../Structures/Block');
import Template = require('../Structures/Template');
import Util = require('./Util');
import ParserError = require('./ParserError');

var inspect = require('eyes').inspector({styles : {all : 'magenta'}});

class Visitor {

    private template : Template = new Template();
    private currentBlock : Block = new Block();

    constructor() {
        this.template.addBlock(this.currentBlock);
    }

    public static constructTemplate(ast : Array<ASTNode>) : any {
        var visitor = new Visitor();
        ast.forEach(function (element) {
            visitor.visit(element);
        });
        visitor.currentBlock.closeElementDescriptor();
        return visitor.template;
    }

    public visit(ast : ASTNode) {
        switch (ast.type) {
            case 'tag':
                this.visitTagNode(ast);
                break;
            case 'text':
                this.visitTextNode(ast.data);
                break;
        }
    }

    private visitTagNode(ast : ASTNode) {
        this.currentBlock.closeElementDescriptor();
        this.currentBlock.openElementDescriptor();

        if (ast.raw.indexOf('/') !== -1) {
            this.currentBlock.htmlString += '<' + ast.raw + '>';
        } else {
            this.currentBlock.htmlString += ('<' + ast.raw + '>');
            ast.children && ast.children.forEach(this.visit, this);
            this.currentBlock.htmlString += ('</' + ast.name + '>');
        }
    }

    private visitTextNode(text) {
        this.currentBlock.closeElementDescriptor();
        this.currentBlock.openElementDescriptor();

        if (Util.containsMustaches(text)) {
            var visitor = this;
            var splitText = Util.splitOnMustaches(text);
            splitText.forEach(function (element, i) {
                if (i % 2 != 0) {
                    visitor.visitMustacheVariable(element);
                } else {
                    visitor.visitInnerText(element);
                }
            }, this);
        } else {
            this.currentBlock.htmlString += Util.removeNewLines(text).trim();
        }
    }

    private visitMustacheVariable(variableName : string) {
        if (!Util.isOnlyWhitespace(variableName)) {
            //todo ensure template defines this variable
            var htmlString = this.currentBlock.htmlString;
            if (htmlString.charAt(htmlString.length - 1) !== '%') {
                this.currentBlock.htmlString += '%';
            }
            variableName = Util.convertBracketsToDots(variableName).trim();
            if (Util.containsFormatter(variableName)) {
                var formatterChain = Util.extractFormatterChain(variableName);
                var variableName = Util.extractMustacheName(variableName);
                var propertyAccessCount = (variableName.match(/\./g) || []).length;
                var output : Array<any> = ["" + propertyAccessCount];
                if (propertyAccessCount !== 0) {
                    var splitVarName = variableName.split('.');
                    output = output.concat(splitVarName);
                } else {
                    output.push(variableName);
                }
                output = output.concat(formatterChain);
                //[propertyAccessCount, prop0, prop1, prop2, formatter0, formatter1]
                this.currentBlock.pushVariable(output);
            } else {
                if (!Util.isValidVariableName(variableName)) {
                    var error = new Error("Invalid variable name: " + variableName + "!");
                    error['errorType'] = ParserError.InvalidVariableName;
                    throw error;
                }
                if (variableName.indexOf('.') !== -1) {
                    this.currentBlock.pushVariable(variableName.split('.'));
                } else {
                    this.currentBlock.pushVariable(variableName);
                }
            }
        } else {
            var error = new Error("Mustache variables cannot be empty!");
            error['errorType'] = ParserError.InvalidVariableName;
            throw error;
        }
    }

    private visitInnerText(text : string) : void {
        this.currentBlock.pushContent(Util.removeNewLines(text));
    }

}

export = Visitor;
//<div id="someId">someText<span class="test">moretext</span></div>
//<div id="someId">someText<span class="test">moretext</span>