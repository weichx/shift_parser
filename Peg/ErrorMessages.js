var ErrorMessages = {
    iBlockHeaderMustBeEmpty: function(iBlockType) {
        return iBlockType + ' blocks must not have content in their tag';
    },
    iBlockHeaderCannotBeEmpty: function(iBlockType) {
        return iBlockType + ' headers must define a valid expression';
    },
    iBlockWrongOrder: function(iBlock, lastIBlock, blockType) {
        return iBlock + ' blocks cannot come after a ' + lastIBlock + ' block inside the same ' + blockType;
    },
    iBlockNotAllowedHere: function(iBlock, blockType) {
        return iBlock + ' cannot be a direct child of ' + blockType + ' blocks.';
    },
    iBlockForbiddenDuplicate: function(iBlock, blockType) {
        return 'A single ' + blockType + ' block can have only one ' + iBlock + ' block';
    },
    /************************ Block Errors *******************************/
    invalidBlockHeaderContent: function(blockType, content) {
        return blockType + ' blocks must have a valid expression in their headers. Found: `' + content + '`';
    },
    unmatchedOpenOrCloseMustache: function(blockType) {
        return blockType + ' block is missing a { or a }.'
    },
    mustacheBlockNotClosed: function(blockType, closedType) {
        return 'Encountered ' + closedType + ' block closing tag while expecting to close ' + blockType + ' block. Make sure you are not attempting to overlap mustache blocks.';
    }
};

module.exports = ErrorMessages;