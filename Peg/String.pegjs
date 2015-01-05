/* ----- 7. Strings ----- */
SourceCharacter
    = .

Quote =
    '"' / "'"
DecimalDigit
    = [0-9]

LineTerminator
    = [\n\r\u2028\u2029]

LineTerminatorSequence "end of line"
    = "\n"
/ "\r\n"
/ "\r"
/ "\u2028"
/ "\u2029"

HexDigit
    = [0-9a-f]i

String "string" =
    chars: SourceCharacter+ { return text(); }

StringLiteral "string"
    = '"' chars:DoubleStringCharacter* '"' {
    return chars.join("");
}
/ "'" chars:SingleStringCharacter* "'" {
    return chars.join("");
}

DoubleStringCharacter
    = !('"' / "\\" / LineTerminator) SourceCharacter { return text(); }
/ "\\" sequence:EscapeSequence { return sequence; }
/ LineContinuation

SingleStringCharacter
    = !("'" / "\\" / LineTerminator) SourceCharacter { return text(); }
/ "\\" sequence:EscapeSequence { return sequence; }
/ LineContinuation

LineContinuation
    = "\\" LineTerminatorSequence { return ""; }

EscapeSequence
    = CharacterEscapeSequence
/ "0" !DecimalDigit { return "\0"; }
/ HexEscapeSequence
/ UnicodeEscapeSequence

CharacterEscapeSequence
    = SingleEscapeCharacter
/ NonEscapeCharacter

SingleEscapeCharacter
    = "'"
/ '"'
/ "\\"
/ "b"  { return "\b";   }
/ "f"  { return "\f";   }
/ "n"  { return "\n";   }
/ "r"  { return "\r";   }
/ "t"  { return "\t";   }
/ "v"  { return "\x0B"; }   // IE does not recognize "\v".

    NonEscapeCharacter
    = !(EscapeCharacter / LineTerminator) SourceCharacter { return text(); }

EscapeCharacter
    = SingleEscapeCharacter
/ DecimalDigit
/ "x"
/ "u"

HexEscapeSequence
    = "x" digits:$(HexDigit HexDigit) {
    return String.fromCharCode(parseInt(digits, 16));
}

UnicodeEscapeSequence
    = "u" digits:$(HexDigit HexDigit HexDigit HexDigit) {
    return String.fromCharCode(parseInt(digits, 16));
}

__ "Optional Whitespace" = (Whitespace*)?
Whitespace "Whitespace" = [ \t\r\n]
OptionalWhitespace "Optional Whitespace" = (Whitespace*)?
RequiredWhitespace "Whitespace" = (Whitespace+)