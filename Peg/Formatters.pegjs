
VariableFormatters =
    OptionalWhitespace formatters: (VariableFormatter)* OptionalWhitespace {
    return formatters && formatters.length !== 0 && formatters || null;
}

VariableFormatter =
    "|" OptionalWhitespace name: VariableFormatterName variant: VariableFormatterVariant? __ {
    return {
        name: name,
        variant: variant
    }
}

VariableFormatterName=
    IdentifierName

VariableFormatterVariant=
    OptionalWhitespace '(' __ variantName: IdentifierName __ ')' {
    return variantName;
}
