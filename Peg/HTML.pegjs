HTMLTag =
__
openTag: HTMLTagOpen
__
children: (StartRule)
__
closeTag:HTMLTagClose?
__
{
    Validators.ensureHTMLElementClosed(openTag, closeTag);
    Validators.ensureIBlockNotChild(openTag.tag, children);
    return {
        type: 'HTMLElement',
        tag: openTag.tag,
        line: openTag.line,
        column: openTag.column,
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
    HTMLOpenSymbol !'/' tagName: HTMLTagName attrs: HTMLAttributes? !'/' closeSymbol: ">"? {
    if(!closeSymbol) Validators.htmlOpenTagNotClosed(tagName, line(), column())
    return {
        tag: tagName,
        line: line(),
        column: column(),
        attributes: attrs
    }
}

HTMLTagClose=
    __ HTMLCloseSymbol __ tagName: HTMLTagName __  attrs: (HTMLAttributes?) __ ">" __{
    Validators.ensureHTMLCloseHasNoAttrs(attrs, tagName, line, column);
    return {
        tag: tagName,
        type: 'close',
        line: line(),
        column: column()
    };
}

HTMLSelfClose=
    HTMLSelfCloseStart tagName: HTMLTagName attrs: HTMLAttributes? HTMLSelfCloseEnd {
    return {
        tag: tagName,
        type: 'HTMLElementSelfClosed',
        closed: true,
        attributes: attrs,
        line: line(),
        column: column()
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
        type: 'mustache',
        line: line(),
        column: column()
    }
}

StringLiteralAttribute = value: StringLiteral {
    return {
        value: value,
        type: 'string',
        line: line(),
        column: column()
    }
}

HTMLAttributeCharacter=
    !('=' / Whitespace "/" / ">") SourceCharacter { return text(); }

HTMLAttribute =
    attrName : HTMLAttributeName "=" attrValue: HTMLAttributeValue {
    return {
        attrName: attrName,
        attrValue : attrValue.value,
        attrType: attrValue.type,
        line: line(),
        column: column()
    }
}

HTMLAttributes =
    OptionalWhitespace attrs:HTMLAttribute* {
    return attrs;
}