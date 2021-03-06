var ErrorMessages = require('./ErrorMessages');
var esprima = require('esprima');
var esprimaparse = esprima.parse;

var error = function () {
    throw new Error('Assign a real error thrower to this function');
};

var blockStack = null;

esprima.parse = function () {
    try {
        esprimaparse.apply(esprimaparse, arguments);
    } catch (e) {
        e.errorType = 'ESPRIMA JS ERROR';
//        e.fileLine = line();
        throw e;
    }
};

var BlockStack = (function () {
    function BlockStack() {
        this.blocks = [];
        this.pushBlock = function (blockName) {
            this.blocks.push({
                blockType: blockName,
                iBlockList: []
            });
        };

        this.popBlock = function () {
            this.blocks.pop();
        };

        this.topBlock = function () {
            return this.blocks[this.blocks.length - 1];
        };

        this.pushIBlock = function (iBlockName) {
            this.topBlock() && this.topBlock().iBlockList.push(iBlockName);
        };

        this.getLastIBlock = function () {
            var topBlock = this.blocks[this.blocks.length - 1];
            return topBlock && topBlock.iBlockList[topBlock.iBlockList.length - 1];
        };
    }

    return BlockStack;
})();


var useHandler = function (error) {

    var explode = function (str, line, col) {
        if (typeof line === 'function') {
            line = line();
        }
        if (typeof col === 'function') {
            col = col();
        }
        error(str + ' Line: ' + line + ' column: ' + col);
    };

    return {
        ensureIBlockEmpty: function (blockType, content, line, column) {
            if (content.trim() !== '') {
                explode(ErrorMessages.iBlockHeaderMustBeEmpty(blockType), line, column);
            }
        },
        ensureIBlockNotEmpty: function (blockType, content, line, column) {
            if (content.trim() === '') {
                explode(ErrorMessages.iBlockHeaderCannotBeEmpty(blockType), line, column);
            }
        },
        ensureLegalIBlockPlacement: function (iBlockType, line, column) {
            var lastBlock = blockStack.topBlock();
            lastBlock || explode(ErrorMessages.iBlockNotAllowedHere(iBlockType, 'the template root'), line, column);
            var lastBlockType = lastBlock.blockType;
            var lastIBlock = lastBlock.iBlockList[lastBlock.iBlockList.length - 1];
            switch (iBlockType) {
                case 'else':
                    if (lastBlockType !== 'if' && lastBlockType !== 'unless') {
                        explode(ErrorMessages.iBlockNotAllowedHere(iBlockType, lastBlockType), line, column);
                    }
                    if (lastIBlock === 'else') {
                        explode(ErrorMessages.iBlockForbiddenDuplicate('else', lastBlockType), line, column);
                    }
                    break;
                case 'elseif':
                    if (lastBlockType !== 'if' && lastBlockType !== 'unless') {
                        explode(ErrorMessages.iBlockNotAllowedHere(iBlockType, lastBlockType), line, column);
                    }
                    if (lastIBlock == 'else') {
                        explode(ErrorMessages.iBlockWrongOrder(iBlockType, lastIBlock, lastBlockType), line, column);
                    }
                    break;
                case 'default':
                    if (lastBlockType !== 'switch') {
                        explode(ErrorMessages.iBlockNotAllowedHere(iBlockType, lastBlockType), line, column);
                    }
                    if (lastIBlock === 'default') {
                        explode(ErrorMessages.iBlockForbiddenDuplicate('default', 'switch'), line, column);
                    }
                    break;
                case 'case':
                    if (lastBlockType !== 'switch') {
                        explode(ErrorMessages.iBlockNotAllowedHere(iBlockType, lastBlockType), line, column);
                    }
                    if (lastIBlock == 'default') {
                        explode(ErrorMessages.iBlockWrongOrder(iBlockType, lastIBlock, lastBlockType), line, column);
                    }
                    break;
            }
        },
        validateBlockHeaderExpression: function (blockType, content, line, column) {
            if (content && content.trim() === '' || !content) {
                explode(ErrorMessages.invalidBlockHeaderContent(blockType, content), line, column);
            } else {
                try {
                    esprima.parse(content);
                } catch(e) {
                    console.log(e)
                }
            }
        },
        mustacheNotClosed: function (blockType, line, column) {
            explode(ErrorMessages.unmatchedOpenOrCloseMustache(blockType), line, column);
        },
        ensureMustacheBlockClosed: function (open, close, line, column) {
            if (open.tag !== close.tag) {
                explode(ErrorMessages.mustacheBlockNotClosed(open.tag, close.tag), line, column);
            }
        },
        ensureLegalSwitchChildren: function (children, line, column) {
            //loop until case or default or non whitespace content
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child.tag === 'intermediateBlock' && child.name === 'default' || child.name === 'case') {
                    break;
                }
                if (child.type === 'Mustache' || child.type === 'Content' && child.text.trim() !== '') {
                    explode(ErrorMessages.illegalSwitchContent(), child.line, child.column);
                }
            }
        },
        unknownBlockType: function (name, line, column) {
            switch (name.trim()) {
                case 'if':
                case 'unless':
                case 'switch':
                case 'foreach':
                    explode(ErrorMessages.invalidBlockHeaderContent(name.trim()), line, column);
                    break;
                default :
                    explode(ErrorMessages.mustacheBlockTypeUnknown(name), line, column);
                    break;
            }
        },
        unknownIBlockType: function (iBlock, line, column) {
            explode(ErrorMessages.iBlockUnknownType(iBlock), line, column);
        },

        invalidComputeBlockLocation: function(locationName, line, column) {
            explode(ErrorMessages.computeBlockNotAllowedHere(locationName), line, column);
        },

        validateForeachFormat: function(foreachSplit, line, column) {
            if(foreachSplit.length < 3 || foreachSplit[1].toLowerCase() !== 'in') {
                explode(ErrorMessages.foreachInvalidFormat(foreachSplit), line, column);
            } else if(foreachSplit[0] === foreachSplit[2]) {
                explode(ErrorMessages.foreachInvalidVariableArrayName(), line, column);
            }
            //todo validate variable and array names.
            //todo validate filters / sorts
        },

        validateForeachVariable: function(variable, line, column) {
            if(!variable) {
                explode(ErrorMessages.foreachRequiresVariable( line, column));
            }
        },

        validateForeachArray: function(array, line, column) {
            //later, validate array literal
            if(!array) {
                explode(ErrorMessages.foreachRequiresArray(), line, column);
            }
        },

        /************************ HTML ****************************/
        ensureIBlockNotChild: function (htmlTagName, children) {
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child.type === 'Mustache' && child.tag === 'intermediateBlock') {
                    explode(ErrorMessages.iBlockNotAllowedHere(child.name, 'an html element (' + htmlTagName + ')'), child.line, child.column);
                }
            }
        },
        ensureHTMLElementClosed: function(openTag, closeTag) {
            if(!closeTag) {
                explode(ErrorMessages.htmlTagNotClosed(openTag.tag), openTag.line, openTag.column);
            }
            if(openTag.tag !== closeTag.tag) {
                explode(ErrorMessages.htmlTagMismatch(openTag.tag, closeTag.tag), openTag.line, openTag.column);
            }
        },
        htmlOpenTagNotClosed: function(openTagName, line, column) {
            explode(ErrorMessages.htmlOpenTagNotClosed(openTagName), line, column);
        },
        ensureHTMLCloseHasNoAttrs: function(attrs, tagName, line, column) {
            attrs && attrs.length !== 0 && explode(ErrorMessages.htmlCloseTagHasAttrs(tagName), line, column);
        },
        /*********************** Variables ************************/
        validateVariableName: function(varName, line, column) {
            if(!varName || varName.trim() === '') {
                explode(ErrorMessages.whitespaceVariableName(), line, column);
            } else {
                //todo check for valid naming, check for array index and property dotting, also ensure no functions are called on the variable
            }
        }
    };
};

module.exports = {
    useHandler: useHandler,
    esprima: esprima,
    createBlockStack: function () {
        blockStack = new BlockStack();
        return blockStack;
    }
};