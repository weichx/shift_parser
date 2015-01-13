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
    },
    computeBlockNotAllowedHere: function(blockName) {
        return blockName + ' blocks cannot accept a compute block.';
    },
    foreachRequiresArray: function() {
        return 'foreach blocks require an array literal or array reference as their second argument.';
    },
    foreachRequiresRocket: function() {
        return 'foreach blocks require a >> symbole after the array and before the variables.';
    },
    /************************ HTML Errors *******************************/
    htmlTagNotClosed: function(tag) {
        return tag + ' element was not closed. Make sure it does not overlap a block.';
    },
    htmlTagMismatch: function(openTagName, closeTagName) {
        return 'Tried to close tag type: <' + openTagName + '> but encountered: </' + closeTagName + '>.';
    },
    htmlOpenTagNotClosed: function(openTagName) {
        return 'Tried to open tag type: <' + openTagName + '> but no closing \'>\' was found.';
    },
    htmlCloseTagHasAttrs: function() {
        return 'HTML closing tags cannot accept attributes';
    },
    /************************ Variables ********************************/
    whitespaceVariableName: function() {
        return 'variables cannot have whitespace names';
    }
};

module.exports = ErrorMessages;