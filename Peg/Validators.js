var ErrorMessages = require('./ErrorMessages');
var esprima = require('esprima');
var esprimaparse = esprima.parse;

var error = function () {
    throw new Error('Assign a real error thrower to this function');
};

esprima.parse = function () {
    try {
        esprimaparse.apply(esprimaparse, arguments);
    } catch (e) {
        e.errorType = 'ESPRIMA JS ERROR';
        e.fileLine = line();
        throw e;
    }
};

var blockStack = new (function () {
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
                esprima.parse(content);
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
        unknownIBlockType: function(iBlock, line, column) {
            explode(ErrorMessages.iBlockUnknownType(iBlock), line, column);
        }
    };
};

module.exports = {
    useHandler: useHandler,
    esprima: esprima,
    blockStack: blockStack
};