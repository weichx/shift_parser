
//todo escape mustaches (maybe triple {)
//todo formalize tags, types, constants, node return types
//todo make sure line numbers are correct on everything sent back
//todo throw the right error when a block is not closed (try the nested case)
//todo better errors around variables not being right {{var x = 5}} etc
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
    Validators.ensureMustacheBlockClosed(open, close, line, column);
    open.tag === 'switch' && Validators.ensureLegalSwitchChildren(children, open.line, open.column);

    return {
        type: 'MustacheBlock',
        tag: open.tag,
        headerContent: open.headerContent,
        computeContent: open.computeContent,
        children: children,
        line: line(),
        column: column()
    }
}

MustacheBlockOpen =
    MustacheOpenCharacters '#' header: MustacheBlockTypeOpen MustacheCloseCharacters
{
    blockStack.pushBlock(header.tag);
    return {
        tag: header.tag,
        headerContent: header.headerContent,
        computeContent: header.computeContent,
        line: line(),
        column: column()
    }
}

MustacheBlockClose =
    MustacheOpenCharacters '/' header: MustacheBlockTypeClose MustacheCloseCharacters
{
    blockStack.popBlock();
    return {
        tag: header.tag,
        attributes: 'add later'
    }
}

Mustache "a Mustache tag"
    = MustacheBlock
    / MustacheBlockIntermediate
    / MustacheTemplateVariable
    / MustacheComment
    / MustacheInterface
    / MustacheVariable


/*********************** Blocks **********************************/
MustacheBlockTypeOpen
    = __ MustacheBlockTypeOpenValidate open: MustacheBlockTypeOpenConsume {
    return open;
}

MustacheBlockTypeOpenConsume
    = __ MustacheBlockIf      Whitespace open: MustacheBlockIfOpen      { return open; }
    / __ MustacheBlockUnless  Whitespace open: MustacheBlockUnlessOpen  { return open; }
    / __ MustacheBlockForeach Whitespace open: MustacheBlockForeachOpen { return open; }
    / __ MustacheBlockSwitch  Whitespace open: MustacheBlockSwitchOpen  { return open; }

//check for valid block names followed by whitespace without moving parse pointer
MustacheBlockTypeOpenValidate
    = &('if'i Whitespace)
    / &('unless'i Whitespace)
    / &('switch'i Whitespace)
    / &('foreach'i Whitespace)
    / invalidBlockName: NotWhiteSpaceOrCloseMustache
{
    Validators.unknownBlockType(invalidBlockName, line, column);
}

MustacheBlockTypeClose
    = __ MustacheBlockIf      __ { return {tag: 'if'     }; }
    / __ MustacheBlockUnless  __ { return {tag: 'unless' }; }
    / __ MustacheBlockForeach __ { return {tag: 'foreach'}; }
    / __ MustacheBlockSwitch  __ { return {tag: 'switch' }; }
    / invalidBlockType: NotWhiteSpaceOrCloseMustache
{
    Validators.unknownBlockType(text(), line, column);
}

MustacheBlockIf      = 'if'i
MustacheBlockUnless  = 'unless'i
MustacheBlockForeach = 'foreach'i
MustacheBlockSwitch  = 'switch'i

MustacheBlockIfOpen "IF BLOCK"
   = computeHeader:GetComputeBlockHeader? headerContent: GetMustacheContent //get expression
{
    Validators.validateBlockHeaderExpression('if', headerContent, line, column);
    return {
        tag: 'if',
        headerContent: headerContent,
        computeContent: computeHeader,
        line: line(),
        column: column()
    };
}
/ . { Validators.mustacheNotClosed('if', line, column) }

MustacheBlockUnlessOpen "UNLESS BLOCK"
    = computeHeader:GetComputeBlockHeader? headerContent: GetMustacheContent //get expression
{
    Validators.validateBlockHeaderExpression('unless', headerContent, line, column);
    return {
        tag: 'unless',
        headerContent: headerContent,
        computeContent: computeHeader,
        line: line(),
        column: column()
    };
}
/ . { Validators.mustacheNotClosed('unless', line, column) }

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
            TemplateVariables: TemplateVariables,
            line: line(),
            column: column()
        },
    };
}

MustacheBlockSwitchOpen "SWITCH BLOCK"
    = computeContent: GetComputeBlockHeader? headerContent: GetMustacheContent
{
    Validators.validateBlockHeaderExpression('switch', headerContent, line, column);
    return {
        tag: 'switch',
        headerContent: headerContent,
        computeContent: computeContent,
        line: line(),
        column: column()
    };
}

/***************** Intermediate Blocks **************************/
MustacheBlockIntermediate
    = MustacheIBlockElse
    / MustacheIBlockElseIf
    / MustacheIBlockCase
    / MustacheIBlockDefault
    / '{{' __ '::' NotWhiteSpaceOrCloseMustache { Validators.unknownIBlockType(text(), line, column); }
    / '{{' __ ':'  NotWhiteSpaceOrCloseMustache { Validators.unknownIBlockType(text(), line, column); }

MustacheIBlockElse =
    MustacheOpenCharacters __
    MustacheBlockIntermediateChar __
    !"elseif"i "else"i __
    expression: GetMustacheContent?
    MustacheCloseCharacters
{
    Validators.ensureIBlockEmpty('else', expression, line, column);
    Validators.ensureLegalIBlockPlacement('else', line, column);
    blockStack.pushIBlock('else');
    return {
        type: 'Mustache',
        tag: 'intermediateBlock',
        name: 'else',
        line: line(),
        column: column()
    }
}

MustacheIBlockElseIf =
    MustacheOpenCharacters __
    MustacheBlockIntermediateChar __
    "elseif"i __
    expression: GetMustacheContent
    MustacheCloseCharacters
{
    Validators.ensureIBlockNotEmpty('elseif', expression, line, column);
    Validators.ensureLegalIBlockPlacement('elseif', line, column);
    Validators.validateBlockHeaderExpression('elseif', expression, line, column);
    blockStack.pushIBlock('elseif');

    return {
        type: 'Mustache',
        tag: 'intermediateBlock',
        name: 'elseif',
        expression: expression,
        line: line(),
        column: column()
    }
}

MustacheIBlockCase =
    MustacheOpenCharacters __
    MustacheBlockIntermediateChar __
    "case"i __
    expression: GetMustacheContent
    MustacheCloseCharacters
{
    //todo case statements should be constant. explore the implementation of switch, maybe precompile into
    //js switch statement, maybe treat like dynamic if ladder
    //see if esprima can verify that for us. 1 identifier, variable, or primitve
    Validators.ensureIBlockNotEmpty('case', expression, line, column);
    Validators.ensureLegalIBlockPlacement('case', line, column);
    Validators.validateBlockHeaderExpression('case', expression, line, column);
    blockStack.pushIBlock('case');

    return {
        type: 'Mustache',
        tag: 'intermediateBlock',
        name: 'case',
        expression: expression,
        line: line(),
        column: column()
    }
}

MustacheIBlockDefault =
    MustacheOpenCharacters __
    MustacheBlockIntermediateChar __
    "default"i __
    expression: GetMustacheContent?
    MustacheCloseCharacters
{
    Validators.ensureIBlockEmpty('default', expression, line, column);
    Validators.ensureLegalIBlockPlacement('default', line, column);
    blockStack.pushIBlock('default');

    return {
        type: 'Mustache',
        tag: 'intermediateBlock',
        name: 'default',
        line: line(),
        column: column()
    }
}
/**************** Standalone Nodes **************************/
MustacheComment =
    MustacheOpenCharacters MustacheCommentChar __ comment: GetMustacheContent __ MustacheCloseCharacters {
    return {
        type: 'Mustache',
        tag: 'comment',
        comment: comment,
        line: line(),
        column: column()
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
        formatters: formatters,
        line: line(),
        column: column()
    }
}

MustacheVariable =
    MustacheOpenCharacters __ name: IdentifierName formatters: VariableFormatters  __ MustacheCloseCharacters{
    return {
        type: 'Mustache',
        tag: 'variable',
        name: name,
        formatters: formatters,
        line: line(),
        column: column()
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
        content: content,
        line: line(),
        column: column()
    }
}

/********************* MISC ******************************/

ComputeBlockChar = __ "=>" __ //to be extended

GetComputeBlockHeader = __ ComputeBlockChar __ args: ComputeBlockArgs? {
    return args;
}

ComputeBlockArgs =
    '(' __ &('&'? IdentifierName) '&'? IdentifierName ComputeBlockRestArgs* ')' {
    return text();
}

ComputeBlockRestArgs=
    __ ',' __ '&'?IdentifierName __

Content "Content" =
    //and checks for existence without moving the poitner, allowing us to star content grabbing.
    //without and, if content is in a * block and returns false, we hit an infinite loop
    &ContentCharacter ContentCharacter* {
        return {
            type: 'Content',
            text: text(),
            line: line(),
            column: column()
        }
    }

ContentCharacter =
    !("<" / "{{" / "}}" ) char : SourceCharacter {
    return char
}


MustacheOpenCharacters   "MustacheOpenCharacters"= "{{"
MustacheCloseCharacters "MustacheCloseCharacters"= "}}"

NotWhiteSpaceOrCloseMustache = ((!Whitespace !'}}') .)* { return text(); }
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