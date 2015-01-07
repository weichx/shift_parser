
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
    Validators.ensureMustacheBlockClosed(open, close, line, column);
    return {
        type: 'MustacheBlock',
        tag: open.tag,
        headerContent: open.headerContent,
        computeContent: open.computeContent,
        children: children
    }
}

MustacheBlockOpen =

    MustacheOpenCharacters '#' header: MustacheBlockTypeOpen MustacheCloseCharacters
{
    blockStack.pushBlock(header.tag); //this might not be ok, depending on order of parsing.
    return {
        tag: header.tag,
        headerContent: header.headerContent,
        computeContent: header.computeContent
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
    Validators.unknownBlockType(text(), line, column);
}

MustacheBlockTypeClose
    = __ MustacheBlockIf      __ { return {tag:  'if'    }; }
    / __ MustacheBlockUnless  __ { return {tag: 'unless' }; }
    / __ MustacheBlockForeach __ { return {tag: 'foreach'}; }
    / __ MustacheBlockSwitch  __ { return {tag: 'switch' }; }
    / invalidBlockType: NotWhiteSpaceOrCloseMustache
{ Validators.unknownBlockType(text(), line, column); }

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
        computeContent: computeHeader
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
        computeContent: computeHeader
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

/***************** Intermediate Blocks **************************/
MustacheBlockIntermediate
    = MustacheIBlockElse
    / MustacheIBlockElseIf
    / MustacheIBlockCase
    / MustacheIBlockDefault

MustacheIBlockElse =
    MustacheOpenCharacters __
    MustacheBlockIntermediateChar __
    !"elseif"i "else"i __
    content: GetMustacheContent
    MustacheCloseCharacters
{
    Validators.ensureIBlockEmpty('else', content, line, column);
    Validators.ensureLegalIBlockPlacement('else', line, column);
    blockStack.pushIBlock('else');
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
        expression: expression
    }
}

MustacheIBlockCase =
    MustacheOpenCharacters __
    MustacheBlockIntermediateChar __
    "case"i __
    expression: GetMustacheContent
    MustacheCloseCharacters
{
    //todo this does not currently take a compute block, case statements should be constant.
    //see if esprima can verify that for us. 1 identifier, variable, or primitve
    Validators.ensureIBlockNotEmpty('case', content, line, column);
    Validators.ensureLegalIBlockPlacement('case', line, column);
    Validators.validateBlockHeaderExpression('case', content, line, column);
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
    content: GetMustacheContent
    MustacheCloseCharacters
{
    Validators.ensureIBlockEmpty('default', content, line, column);
    Validators.ensureLegalIBlockPlacement('default', line, column);
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
            text: text()
        }
    }

ContentCharacter =
    !("<" / "{{" / "}}" ) char : SourceCharacter {
    return char
}


MustacheOpenCharacters   "MustacheOpenCharacters"= "{{"
MustacheCloseCharacters "MustacheCloseCharacters"= "}}"

NotWhiteSpaceOrCloseMustache = ((![ /n/t] !'}}') .)*
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