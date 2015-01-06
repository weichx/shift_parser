var ErrorMessages = require('./ErrorMessages');
var esprima = require('esprima');
var esprimaparse = esprima.parse;

var error = function() {
    throw new Error('Assign a real error thrower to this function');
};

esprima.parse = function() {
    try {
        esprimaparse.apply(esprimaparse, arguments);
    } catch(e) {
        e.errorType = 'ESPRIMA JS ERROR';
        e.fileLine = line();
        throw e;
    }
};

var blockStack = new (function() {
    this.blocks = [];
    this.pushBlock = function(blockName) {
        this.blocks.push({
            blockType: blockName,
            iBlockList: []
        });
    };

    this.popBlock = function() {
        this.blocks.pop();
    };

    this.topBlock = function() {
        return this.blocks[this.blocks.length - 1];
    };

    this.pushIBlock = function(iBlockName) {
        this.topBlock() && this.topBlock().iBlockList.push(iBlockName);
    };

    this.getLastIBlock = function() {
        var topBlock = this.blocks[this.blocks.length - 1];
        return topBlock && topBlock.iBlockList[topBlock.iBlockList.length - 1];
    };
})();


var useHandler = function(error) {

    var explode = function(str, lineFn, colFn) {
        error(str + ' Line: ' + lineFn() + ' column: ' + colFn());
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
        mustacheNotClosed: function(blockType, line, column) {
            explode(ErrorMessages.unmatchedOpenOrCloseMustache(blockType), line, column);
        },
        ensureMustacheBlockClosed: function(open, close, line, column) {
            if(open.tag !== close.tag) {
                explode(ErrorMessages.mustacheBlockNotClosed(open.tag, close.tag), line, column);
            }
        }
    };
};

module.exports = {
    useHandler: useHandler,
    esprima: esprima,
    blockStack: blockStack
};