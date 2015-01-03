enum ParserError {
    InvalidVariableName,
    ParseInterfaceInvalidVariableName,
    ParseInterfaceUnsupportedVariableType,
    NotSemiColonDelimited,
    MultipleInterfaceBlocks,
    UndeclaredVariables
}

export = ParserError;