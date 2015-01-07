var ErrorMessages = {
    iBlockHeaderMustBeEmpty: function(iBlockType) {
        return iBlockType + ' blocks must not have content in their tag.';
    },
    iBlockHeaderCannotBeEmpty: function(iBlockType) {
        return iBlockType + ' headers must define a valid expression.';
    },
    iBlockWrongOrder: function(iBlock, lastIBlock, blockType) {
        return iBlock + ' blocks cannot come after a ' + lastIBlock + ' block inside the same ' + blockType + '.';
    },
    iBlockNotAllowedHere: function(iBlock, blockType) {
        return iBlock + ' cannot be a direct child of ' + blockType + '.';
    },
    iBlockForbiddenDuplicate: function(iBlock, blockType) {
        return 'A single ' + blockType + ' block can have only one ' + iBlock + ' block.';
    },
    iBlockUnknownType: function(iBlock) {
        return iBlock + ' is not a valid intermediate block type. Valid types are [::case, ::default, ::else, ::elseif].';
    },
    /************************ Block Errors *******************************/
    invalidBlockHeaderContent: function(blockType, content) {
        var found = content && content.trim() !== '';
        var str = '`' + blockType + '` blocks must have a valid expression in their headers. ';
        if(found) str += 'Found: ' + content;
        return  str;
    },
    unmatchedOpenOrCloseMustache: function(blockType) {
        return 'Unmatched { or } found inside `' + blockType + '` block header.';
    },
    mustacheBlockNotClosed: function(blockType, closedType) {
        return 'Encountered ' + closedType + ' block closing tag while expecting to close ' + blockType + ' block. Make sure you are not attempting to overlap mustache blocks.';
    },
    mustacheBlockTypeUnknown: function(blockType) {
        return '`' + blockType + '` is not a valid block! Valid blocks are [if, unless, switch, and foreach].';
    },
    illegalSwitchContent: function() {
        return 'switch blocks cannot have content between their headers and their first ::case or ::default.';
    }
};

module.exports = ErrorMessages;