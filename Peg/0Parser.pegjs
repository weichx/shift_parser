//todo escape mustaches (maybe triple {)
StartProgram = program: StartRule { return program; }

StartRule =
    nodes: (HTMLTag / HTMLSelfClose / Mustache / Content)* {
    return nodes;
}

MustacheBlock "MustacheBlock" =
    __
    open: MustacheBlockOpen
    __
    children: StartRule
    __
    close: MustacheBlockClose
    __
{
    if(open.tag !== close.tag) {
        error(open.tag + " tag not closed");
    }
    return {
        type: 'MustacheBlock',
        tag: open.tag,
        headerContent: open.headerContent,
        children: children
    }
}

MustacheBlockOpen =

    MustacheOpenCharacters '#' header: MustacheBlockTypeOpen MustacheCloseCharacters {
    return {
        tag: header.tag,
        headerContent: header.headerContent
    }
}

MustacheBlockClose =
    MustacheOpenCharacters '/' header: MustacheBlockTypeClose MustacheCloseCharacters {
    return {
        tag: header.tag,
        attributes: 'add later'
    }
}

Mustache "MustacheContent"
    = MustacheBlock
    / MustacheBlockIntermediate
    / MustacheTemplateVariable
    / MustacheComment
    / MustacheInterface
    / MustacheVariable


/*********************** BLocks **********************************/
MustacheBlockTypeOpen
    = __ MustacheBlockIf      Whitespace open: MustacheBlockIfOpen      { return open; }
    / __ MustacheBlockUnless  Whitespace open: MustacheBlockUnlessOpen  { return open; }
    / __ MustacheBlockForeach Whitespace open: MustacheBlockForeachOpen { return open; }
    / __ MustacheBlockSwitch  Whitespace open: MustacheBlockSwitchOpen  { return open; }
    /  . { error('Expected a valid block type to be opened [if, unless, foreach, switch]. ' +
                 'You may be missing whitespace after the block name, or blocks might be overlapping.' +
                 'The block may also be empty, which is not allowed. Line: ' + line() + ' column: ' + column()); }


MustacheBlockTypeClose
    = __ MustacheBlockIf      __ { return {tag:  'if'    }; }
    / __ MustacheBlockUnless  __ { return {tag: 'unless' }; }
    / __ MustacheBlockForeach __ { return {tag: 'foreach'}; }
    / __ MustacheBlockSwitch  __ { return {tag: 'switch' }; }
    / . { expected('A valid block type to be closed [if, unless, foreach, switch]'); }

//check for 'block name ' then consume it if its there
MustacheBlockIf      = &('if'i)      'if'i
MustacheBlockUnless  = &('unless'i)  'unless'i
MustacheBlockForeach = &('foreach'i) 'foreach'i
MustacheBlockSwitch  = &('switch'i)  'switch'i



MustacheBlockIfOpen "IF BLOCK"
   = headerContent: GetMustacheContent
{
    if(headerContent.trim() === '') {
        error('At least one symbol is required inside the IF BLOCK header around line: ' + line() + " column: " + column());
    }
    return {
        tag: 'if',
        headerContent: headerContent
    };
}
/ . { error("Unmatched { or } found inside IF BLOCK around line: " + line() + " column: " + column())}



MustacheBlockUnlessOpen "UNLESS BLOCK"
    = headerContent: GetMustacheContent
{
    if(headerContent.trim() === '') {
        error('At least one symbol is required inside the UNLESS BLOCK header around line: ' + line() + " column: " + column());
    }
    return {
        tag: 'unless',
        headerContent: headerContent
    };
}

MustacheBlockForeachOpen "FOREACH BLOCK"
    = arrayName: IdentifierName
      formatters: VariableFormatters?
      __ '>>'
      TemplateVariables: (ForeachTemplateVariable)*
{
    return {
        tag: 'foreach',
        headerContent: {
            arrayName: arrayName,
            formatters: formatters,
            TemplateVariables: TemplateVariables
        },
    };
}

MustacheBlockSwitchOpen "SWITCH BLOCK"
    = headerContent: GetMustacheContent
{
    if(headerContent.trim() === '') {
        error('At least one symbol is required inside the SWITCH BLOCK header around line: ' + line() + " column: " + column());
    }
    return {
        tag: 'switch',
        headerContent: headerContent
    };
}
/***************** Intermediat Blocks **************************/

MustacheBlockIntermediate
    = MustacheIBlockElse
    / MustacheIBlockElseIf
    / MustacheIBlockCase
    / MustacheIBlockDefault

MustacheIBlockElse =
    MustacheOpenCharacters __
    MustacheBlockIntermediateChar __
    "else"i __
    MustacheCloseCharacters {
    return {
        type: 'Mustache',
        tag: 'intermediateBlock',
        name: 'else'
    }
}

MustacheIBlockElseIf =
    MustacheOpenCharacters __
    MustacheBlockIntermediateChar __
    "elseif"i __
    MustacheCloseCharacters {
    return {
        type: 'Mustache',
        tag: 'intermediateBlock',
        name: 'elseif'
    }
}

MustacheIBlockCase =
    MustacheOpenCharacters __
    MustacheBlockIntermediateChar __
    "case"i __
    expression: GetMustacheContent
    MustacheCloseCharacters {
    return {
        type: 'Mustache',
        tag: 'intermediateBlock',
        name: 'case',
        expression: expression
    }
}

MustacheIBlockDefault =
    MustacheOpenCharacters __
    MustacheBlockIntermediateChar __
    "default"i __
    MustacheCloseCharacters {
    return {
        type: 'Mustache',
        tag: 'intermediateBlock',
        name: 'default'
    }
}
/**************** Standalone Nodes **************************/
MustacheComment =
    MustacheOpenCharacters MustacheCommentChar __ comment: GetMustacheContent __ MustacheCloseCharacters {
    return {
        type: 'Mustache',
        tag: 'comment',
        comment: comment
    };
}

MustacheTemplateVariable =
    MustacheOpenCharacters __ "&"
    name: IdentifierName __
    formatters: VariableFormatters?
    MustacheCloseCharacters {
    return {
        type: 'Mustache',
        tag: 'TemplateVariable',
        name: name,
        formatters: formatters
    }
}

MustacheVariable =
    MustacheOpenCharacters __ name: IdentifierName formatters: VariableFormatters  __ MustacheCloseCharacters{
    return {
        type: 'Mustache',
        tag: 'variable',
        name: name,
        formatters: formatters
    };
}

MustacheInterface =
    MustacheOpenCharacters __
    MustacheInterfaceChar __
    content: GetMustacheContent
    MustacheCloseCharacters {
    return {
        type: 'Mustache',
        tag: 'interface',
        content: content
    }
}

/********************* MISC ******************************/

ComputeBlock = __ "=>" __ //to be extended

Content "Content" =
    //and checks for existence without moving the poitner, allowing us to star content grabbing.
    //without and, if content is in a * block and returns false, we hit an infinite loop
    &ContentCharacter ContentCharacter* {
        return {
            type: 'Content',
            text: text()
        }
    }

ContentCharacter =
    !("<" / "{{" / "}}" ) char : SourceCharacter {
    return char
}


MustacheOpenCharacters   "MustacheOpenCharacters"= "{{"
MustacheCloseCharacters "MustacheCloseCharacters"= "}}"

GetMustacheContent = (TraverseJS)*  EnsureNoOverflowBraces { return text(); }

OpenObject = "{" TraverseJS* '}'
TraverseJS = (OpenObject / JSContent)
JSContent = (StringLiteral / JSContentCharacter)
JSContentCharacter = !("{" / "}") char: . { return char; }
EnsureNoOverflowBraces= !('}}}') &('}}')

MustacheBlockStart= "#"
MustacheBlockEnd  = "/"
MustacheBlockIntermediateChar = "::"
MustacheInterfaceChar = ">>"
MustacheComputeChar = '=>'
MustacheCommentChar= "!"

ForeachTemplateVariable
 = __ IdentifierName __ ':' __ IdentifierName __ {
    return text().trim();
}