import Block = require('../Structures/Block');
import Template = require('../Structures/Template');
import TemplateInterface = require('../Structures/TemplateInterface');
import Util = require('./Util');
import ParserError = require('./ParserError');

var inspect = require('eyes').inspector({styles: {all: 'magenta'}});

class Visitor {

    private template : Template = new Template();
    private currentBlock : Block = new Block();
    private userDefinedVariables : Array<string> = [];
    public static TEST : boolean = false;

    constructor() {
        this.template.addBlock(this.currentBlock);
    }

    public static constructTemplate(ast : Array<ASTNode>) : any {
        var visitor = new Visitor();
        ast.forEach(function (element) {
            visitor.visit(element);
        });
        visitor.currentBlock.closeElementDescriptor();
        visitor.validateVariables();
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
                    visitor.visitMustache(element);
                } else {
                    visitor.visitInnerText(element);
                }
            }, this);
        } else {
            this.currentBlock.htmlString += Util.removeNewLines(text).trim();
        }
    }

    private visitMustache(mustache : string) : void {
        mustache = Util.unescape(mustache).trim();
        if (mustache.indexOf('interface') === 0) {
            this.createTemplateInterface(mustache);
        } else {
            this.visitMustacheVariable(mustache);
        }
    }

    private visitMustacheVariable(variableName : string) {
        if(this.userDefinedVariables.indexOf(variableName) === -1) {
            this.userDefinedVariables.push(variableName);
        }
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

    private createTemplateInterface(mustache : string) : void {
        if(this.template.templateInterface) {
            var error = new Error("Multiple interface blocks are not allowed!");
            error['errorType'] = ParserError.MultipleInterfaceBlocks;
            throw error;
        }
        //todo for now assume this is well formatted, will also need to check for complex return types
        //replace all whitespace with ''
        //replace all semi colons with :
        //split on :
        //win
        var mustacheNameStartIndex = mustache.indexOf('interface') + 'interface'.length;
        mustache = mustache.substring(mustacheNameStartIndex + 1);
        mustache = mustache.replace(/\s+/g, '');
        mustache = mustache.replace(/;/g, ':');

        var split = mustache.split(":");
        if ((split.length - 1) % 2 !== 0) {
            var error = new Error("Error when parsing interface block, unable to match types to variables, be sure to end with ;");
            error['errorType'] = ParserError.NotSemiColonDelimited;
            throw error;
        }
        var templateInterface = new TemplateInterface();
        //-1 for the extra '' in split from ; -> : replacement
        for (var i = 0; i < split.length - 1; i = i + 2) {
            var variableName = split[i];
            var variableType = split[i + 1];
            if (!Util.isValidVariableName(variableName)) {
                var error = new Error(variableName + " is not a valid variable name");
                error['errorType'] = ParserError.ParseInterfaceInvalidVariableName;
                throw error;
            }
            if (!Util.isValidVariableType(variableType)) {
                //todo nicer error message
                var error = new Error(variableName + " is not a supported variable type");
                error['errorType'] = ParserError.ParseInterfaceUnsupportedVariableType;
                throw error
            }
            templateInterface.addVariable(variableName, variableType);
        }
        this.template.templateInterface = templateInterface;
    }

    private validateVariables() : void {
        if(!Visitor.TEST) {
            var shouldThrow = false;
            if (this.template.templateInterface) {
                var templateVariables = this.template.templateInterface.variables;
                var userDefinedVariables = this.userDefinedVariables;
                shouldThrow = !userDefinedVariables.every(function(variable) {
                    return <boolean>templateVariables[variable];
                });
            } else {
                if (this.userDefinedVariables.length !== 0) {
                    shouldThrow = true;
                }
            }
            if(shouldThrow) {
                var error = new Error("You must define variables in an interface block before using them." + this.userDefinedVariables);
                error['errorType'] = ParserError.UndeclaredVariables;
                throw error;
            }
        }
    }
}

export = Visitor;