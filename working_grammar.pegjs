Program =
    ( __ (Tag / Mustache  /'3')__ )*

__ "Optional Whitespace" = (Whitespace*)?
    Whitespace "Whitespace" = [ \t\r\n]

TagOpen =
    '<div>'
TagClose =
    '</div>'
Tag=
    __ TagOpen __('3'* Mustache * '3'*) __ (Tag / '3' / Mustache)* __ ('3'*  Mustache * '3' *) __ TagClose __

MustacheVar =
    __ MustacheOpen __ MustacheContent __ MustacheClose __

MustacheOpen =
    '{{'

MustacheClose =
    '}}'

MustacheContent =
    'stash'

MustacheBlockOpen=
    MustacheOpen '#' MustacheClose

MustacheBlockClose=
    MustacheOpen '/' MustacheClose

Mustache =
    MustacheVar / MustacheBlock

MustacheBlock =
    __ MustacheBlockOpen __ ('3' * Tag * '3' *) __ (Mustache*) __ ('3'* Tag * '3'*) __ MustacheBlockClose __