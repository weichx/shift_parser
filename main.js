var Parser = require('htmlparser');
var fs = require('fs');
var inspect = require('eyes').inspector({styles: {all: 'magenta'}});
var mustacheRegex = /{{(.*?)}}/;

var ElementDescriptor = function () {
    this.variables = [];
    this.content = [];
    this.index = 0;
};

ElementDescriptor.prototype.notEmpty = function () {
    return this.variables.length !== 0 || this.content.length !== 0;
};

var Block = function () {
    this.htmlString = '';
    this.elementDescriptors = [];
    this.elementDescriptorIndices = [];
    this.elementCount = 0;
    this.blockFunction = null;
    this.blockInputs = [];
    this.blockOutputs = [];
};

var blocks = [];
var blockStack = [];
var currentBlock = new Block();
var currentElementDescriptor = new ElementDescriptor();
blocks.push(currentBlock);
blockStack.push(currentBlock);

fs.readFile('template.shift', 'utf-8', function (error, string) {

    var handler = new Parser.DefaultHandler(function (error, ast) {
        if (error) {
            console.log(error);
        } else {
           // inspect(ast);
            ast.forEach(function (element) {
                visit(element);
            });
        }
    }, {ignoreWhitespace: true});

    var parser = new Parser.Parser(handler);
    var result = string.replace(/\{\{.*?\}\}/g,function(match) {
        return match.replace(/</g,"&lt;").replace(/>/g, "&gt;");
    });
    parser.parseComplete(result);
    closeElementDescriptor();
    console.log();
    inspect(blocks);
    //printedBlocks = objToJs();
    //fs.writeFile('template.js', "var b = " + objToJs(b) + ';', function (err, done) {
    //    if (err) console.log(err);
    //});
});

var visit = function (ast) {
//    console.log('visit called', ast.type);
    currentBlock.elementCount++; //todo this isnt right
    switch (ast.type) {
        case 'tag':
            visitTagNode(ast);
            break;
        case 'text':
            visitTextNode(ast.data);
            break;
    }
};

var visitTagNode = function (ast) {
    // console.log(ast);
    //add a descriptor if we used it
    closeElementDescriptor();
    openElementDescriptor();

    currentBlock.htmlString += ('<' + ast.raw + '>');
    ast.children && ast.children.forEach(visit);
    if (ast.raw.indexOf('/') < -1) {
        currentBlock.htmlString += ('</' + ast.name + '>');
    } else {
        currentBlock.htmlString += ('<' + ast.name + '>');
    }
};

var visitTextNode = function (text) {
    //handle empty text?
    if (containsMustache(text)) {
        var splitLine = splitMustaches(text);
        if (isBlock(text)) {
            //console.log('START IS BLOCK');
            //console.log(text);
            var blockName = getBlockName(text);
            var blockHeader = extractBlockHeader(text);
            var blockContents = extractBlockContents(text);

            visitBlockStart(blockName, blockHeader, blockContents);
            visitTextNode(blockContents);
            visitBlockEnd();

        } else if (containsBlock(text)) {
            var blockStartIndex = text.indexOf(("{{#"));
            var preBlock = text.substring(0, blockStartIndex);
            var rest = text.substr(blockStartIndex);
            var blockName = getBlockName(rest);
            var blockCloseText = '{{/' + blockName + '}}';
            // console.log(blockCloseText);
            // console.log(rest);
            var postBlockStartIndex = rest.lastIndexOf(blockCloseText);
            console.log(rest);
            if (postBlockStartIndex === -1) throw new Error("Block " + blockName + " was not closed");
            var postBlock = rest.substr(postBlockStartIndex + blockCloseText.length);
            var block = text.substr(blockStartIndex, postBlockStartIndex + blockCloseText.length);
            visitTextNode(preBlock);
            visitTextNode(block);
            visitTextNode(postBlock);
            //console.log('pre block: ', preBlock);
            //console.log('block name', blockName);
            //console.log('block: ', block);
            //console.log('post block: ', postBlock);
        } else {
            splitLine.forEach(function (element, i) {
                if (i % 2 != 0) {
                    visitMustache(element);
                } else {
                    visitInnerText(element);
                }
            });
        }
    } else {
        currentBlock.htmlString += removeNewLines(text).trim();
    }
};

var visitInnerText = function (input) {
    currentElementDescriptor.content.push(removeNewLines(input));
};

var visitBlockStart = function (blockName, blockheader, blockContent) {
    //console.log('visiting', input);
    closeElementDescriptor();
    //todo this separator is likely not quite right, explore when building dom from structures
    currentBlock.htmlString += 'BLOCK' + blocks.length;
    blockStack.push(currentBlock);
    currentBlock = new Block();
    blocks.push(currentBlock);
    currentBlock.blockFunction = createBlockFunction(blockName, blockheader, blockContent);
    //todo get block function
    openElementDescriptor();
};

var visitBlockEnd = function (input) {
    currentBlock = blockStack.pop();
};

var visitIntermediateBlock = function (input) {

};

var visitVariableNode = function (input) {
    if (!isEmpty(input)) {
        var htmlString = currentBlock.htmlString;
        if (htmlString.charAt(htmlString.length - 1) !== '%') {
            currentBlock.htmlString += '%';
        }
        //handle somevar[i].property
        input = input.replace(/]/g, '.').replace(/\[/g, '.').replace(/\.\./g, '.');
        if (input.indexOf('.') !== -1) {
            currentElementDescriptor.variables.push(input.split('.'));
        } else {
            currentElementDescriptor.variables.push(input);
        }
    }
};

var visitMustache = function (input) {
    input = input.trim();
    if (isBlock(input)) {
        //if (input.indexOf('#') === 0) {
        visitBlockStart(input);
        throw new Error("should not hit visitmustache start block");

    } else if (input.indexOf('/') === 0) {
        visitBlockEnd(input);

    } else if (input.indexOf('::') === 0) {
        visitIntermediateBlock(input);

    } else {
        visitVariableNode(input);
    }
};

var splitMustaches = function (string) {
    return string.split(mustacheRegex);
};

var hasMustaches = function (string) {
    return string.split(mustacheRegex).length > 1
};

var removeNewLines = function (string) {
    return string.replace(/\r?\n|\r/g, '');
};

var isEmpty = function (string) {
    return string.trim() === '';
};

var closeElementDescriptor = function () {
    if (currentElementDescriptor.notEmpty()) {
        var lastContentIndex = currentElementDescriptor.content.length - 1;
        var firstContent = currentElementDescriptor.content[0];
        var lastContent = currentElementDescriptor.content[lastContentIndex];

        currentElementDescriptor.content[0] = firstContent.trimLeft();
        currentElementDescriptor.content[lastContentIndex] = lastContent.trimRight();
        currentBlock.elementDescriptors.push(currentElementDescriptor);
        currentBlock.elementDescriptorIndices.push(currentElementDescriptor.index);
    }
};

var openElementDescriptor = function () {
    //create a descriptor for this element, it might not be used.
    currentElementDescriptor = new ElementDescriptor();
    currentElementDescriptor.index = currentBlock.elementCount;
};

//todo ensure block start name === block end name
var isBlock = function (text) {
    return (text.trim().indexOf('{{#') === 0);
};

var extractBlockHeader = function (input) {
    var blockName = getBlockName(input);
    var startHeaderIndex = input.indexOf('{{#');
    var str = input.substr(startHeaderIndex);
    var endHeaderIndex = input.indexOf('}}');
    return str.substring(startHeaderIndex + 3 + blockName.length, endHeaderIndex);
};

var extractBlockContents = function (input) {
    var firstCloseIndex = input.indexOf('}}');
    var lastOpenIndex = input.lastIndexOf('{{');
    return input.substring(firstCloseIndex + 2, lastOpenIndex);
};

var containsBlock = function (input) {
    return input.indexOf("{{#") !== -1;
};

var containsMustache = function (input) {
    return input.indexOf('{{') !== -1;
};

var getBlockName = function (input) {
    var index = input.indexOf("{{#");
    if (index === -1) {
        throw new Error("No block name in " + input);
    }
    var char = input.charAt(index + 3);

    while (!isEmpty(char) && char !== '}') {
        index++;
        char = input.charAt(index);
    }
    return input.substring(3, index);
};

var createBlockFunction = function (blockName, blockHeader, blockContents) {
    console.log('creating fn', blockName, blockHeader, blockContents);
    var fn = blockFns[blockName];
    if(!fn) {
        throw new Error("Unknown block function: " + blockName);
    }
    return fn(blockHeader);
};

var blockFns = {
    'if': function (blockHeader) {
        var fn = function(condition) {
            return condition == true;
        };

        fn.name = 'blockFn_if';
        //could be maybe shared if arguments are condensed into arguments[0]
        return fn;
    },
    'unless': function(blockHeader) {
        return 'function() {\return !(' + blockHeader + ');\n}';
    }
};

var getFunctionArguments = function(fn) {
    var fnString = fn.toString();
    var argStartIndex = fnString.indexOf('(') + 1;
    var argEndIndex = fnString.indexOf(')');
    var argumentString = fnString.substring(argStartIndex, argEndIndex);
    var argumentArray = argumentString.split(',');
    return argumentArray.map(function(arg) { return arg.trim()});
};

var getFunctionBody = function(fn) {
    var fnStr = fn.toString();
    var bodyStartIndex = fnStr.indexOf('{');
    var bodyEndIndex = fnStr.indexOf('}');
    return fnStr.substring(bodyStartIndex, bodyEndIndex);
};

var tab = function(tabs) {
    var prefix = '';
    for(var i = 0; i < tabs; i++) {
        prefix += '\t';
    }
    return prefix;
};

var objToJs = function (object, depth) {
    var output = '';
    depth = depth || 1;
    if (Array.isArray(object)) {
        output += '[';
        for (var i = 0; i < object.length; i++) {
            output += objToJs(object[i], depth + 1);
            if (i !== object.length - 1) {
                output += ', ';
            }
        }
        output += ']';
    } else if (object === null) {
        output += 'null';
    } else if (typeof object === 'object') {
        output += tab(depth) + '{\n';
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                output += tab(depth) + key + ': ';
                output += objToJs(object[key]) + ',\n';
            }
        }
        output = output.substring(0, output.length - 2);
        output += tab(depth) + '\n}';
    } else if (typeof object === 'string') {
        output += "'" + object + "'";
    } else if (typeof object === 'number') {
        output += object;
    } else if (typeof object === 'function') {
        output += object.toString();
    }
    return output;
};