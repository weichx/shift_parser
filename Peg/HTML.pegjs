HTMLTag =
__
openTag: HTMLTagOpen
__
children: (StartRule)
__
closeTag:HTMLTagClose
__
{
    if (openTag.tag !== closeTag.tag) {
        error(openTag.tag + " tag not closed");
    }
    return {
        type: 'HTMLElement',
        tag: openTag.tag,
        attributes: openTag.attributes.length !== 0 && openTag.attributes || null,
        closed: closeTag.tag == openTag.tag && true || false,
        children: children && children.length !== 0 && children || null
    };
}


HTMLOpenSymbol "HTMLOpenTag" = '<'
HTMLCloseSymbol "HTMLCloseTag" = '</'
HTMLSelfCloseStart "HTMLSelfClosingTag" = "<"
HTMLSelfCloseEnd "HTMLSelfClosingTagEnd" = "/>"

HTMLTagOpen=
    HTMLOpenSymbol !'/' tagName: HTMLTagName attrs: HTMLAttributes? !'/' ">" {
    return {
        tag: tagName,
        attributes: attrs
    }
}

HTMLTagClose=
    __ HTMLCloseSymbol tagName: HTMLTagName ">" __{
    return {
        tag: tagName,
        type: 'close'
    };
}

HTMLSelfClose=
    HTMLSelfCloseStart tagName: HTMLTagName attrs: HTMLAttributes? HTMLSelfCloseEnd {
    return {
        tag: tagName,
        type: 'HTMLElementSelfClosed',
        closed: true,
        attributes: attrs
    }
}

HTMLTagName =
    __ tagName: (HTMLTagCharacter+) __ { return tagName.join(""); }

HTMLTagCharacter=
    !('>' / '/' /Whitespace). { return text(); }

/********************HTML Attributes **********************/
HTMLAttributeName=
    OptionalWhitespace attrName : (HTMLAttributeCharacter+) {
    return text();
}

HTMLAttributeValue
    = MustacheHTMLAttribute
/ StringLiteralAttribute

MustacheHTMLAttribute
    = Quote '{{' value: MustacheVariable+ '}}' Quote {
    if(value.length !== 1) {
        error("You can only name one mustache variable inside a variable block. Line: " + line() + ", Column: " + column());
    }
    //todo if we introduce compute blocks or bind once this will need to be updated
    return {
        value: value,
        formatters: value.formatters,
        type: 'mustache'
    }
}

StringLiteralAttribute = value: StringLiteral {
    return {
        value: value,
        type: 'string'
    }
}

HTMLAttributeCharacter=
    !('=' / Whitespace "/" / ">") SourceCharacter { return text(); }

HTMLAttribute =
    attrName : HTMLAttributeName "=" attrValue: HTMLAttributeValue {
    return {
        attrName: attrName,
        attrValue : attrValue.value,
        attrType: attrValue.type
    }
}

HTMLAttributes =
    OptionalWhitespace attrs:HTMLAttribute* {
    return attrs;
}