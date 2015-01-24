
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
        line: line(),
        column: column(),
        headerContent: open.headerContent,
        computeContent: open.computeContent,
        children: children
    }
}

MustacheBlockOpen =
    MustacheOpenCharacters '#' header: MustacheBlockTypeOpen MustacheCloseCharacters
{
    blockStack.pushBlock(header.tag);
    return {
        tag: header.tag,
        line: line(),
        column: column(),
        headerContent: header.headerContent,
        computeContent: header.computeContent,
    }
}

MustacheBlockClose =
    MustacheOpenCharacters '/' header: MustacheBlockTypeClose MustacheCloseCharacters
{
    blockStack.popBlock();
    return {
        tag: header.tag,
        line: line(),
        column: column()
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
        line: line(),
        column: column(),
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
        line: line(),
        column: column(),
        headerContent: headerContent,
        computeContent: computeHeader
    };
}
/ . { Validators.mustacheNotClosed('unless', line, column) }

T = IdentifierName RequiredWhitespace

MustacheBlockForeachOpen "FOREACH BLOCK"
    = headerContent: GetMustacheContent
{
    var split = headerContent.match(/\S+/g);
    Validators.validateForeachFormat(split);
    var variable = split[0];
    var array = split[2];
    return {
        tag: 'foreach',
        headerContent: {
            variable: variable,
            array: array,
            line: line(),
            column: column()
        },
    };
}/ . { Validators.mustacheNotClosed('foreach', line, column) }

MustacheBlockSwitchOpen "SWITCH BLOCK"
    = computeContent: GetComputeBlockHeader? headerContent: GetMustacheContent
{
    Validators.validateBlockHeaderExpression('switch', headerContent, line, column);
    return {
        tag: 'switch',
        line: line(),
        column: column(),
        headerContent: headerContent,
        computeContent: computeContent
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
computeExpression: GetComputeBlockHeader?
    expression: GetMustacheContent
MustacheCloseCharacters
{
    //todo case statements should be constant. explore the implementation of switch, maybe precompile into
    //js switch statement, maybe treat like dynamic if ladder
    //see if esprima can verify that for us. 1 identifier, variable, or primitve
    Validators.ensureIBlockNotEmpty('case', expression, line, column);
    Validators.ensureLegalIBlockPlacement('case', line, column);
    //todo   Validators.ensureNoComputeBlock('case', computeExpression, line, column);
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
        line: line(),
        column: column(),
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
        line: line(),
        column: column(),
        formatters: formatters
    }
}

MustacheVariable =
    MustacheOpenCharacters __ name: IdentifierName? formatters: VariableFormatters  __ MustacheCloseCharacters {
    Validators.validateVariableName(name);
    return {
        type: 'Mustache',
        tag: 'variable',
        name: name,
        line: line(),
        column: column(),
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
        line: line(),
        column: column(),
        content: content
    }
}

/********************* MISC ******************************/

ComputeBlockChar = __ "=>" __

//todo this will need to do paren matching correctly
GetComputeBlockHeader = __ ComputeBlockChar __  args: ComputeBlockArgs? {
    return args;
}

ComputeBlockArgs =
    '(' __ &('&'? IdentifierName) '&'? IdentifierName ComputeBlockRestArgs* ')' {
    return text();
}

ComputeBlockRestArgs=
    __ ',' __ '&'?IdentifierName __


MustacheOpenCharacters   "MustacheOpenCharacters"= "{{"
MustacheCloseCharacters "MustacheCloseCharacters"= "}}"
NotWhiteSpaceOrCloseMustache = ((!Whitespace !'}}') .)* { return text(); }
NotWhiteSpaceOrCloseMustacheOrPipe = ((!Whitespace !'}}' !'|').)* { return text(); }
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

EscapedMustache "escaped Mustache" =
    (__ '{{{' __ / __ '}}}' __) {
    return {
        type: 'Content',
        line: line(),
        column: column(),
        text: text().slice(0, 1)
    }
}
