//todo formalize tags, types, constants, node return types
//todo make sure line numbers are correct on everything sent back
//todo throw the right error when a block is not closed (try the nested case)
//todo better errors around variables not being right {{var x = 5}} etc
//todo support var.property and var[i] and var[i].property
//todo decide if compute blocks should valid or expect them in script components
//todo foreach filters and sorts and index names (local and global)
StartProgram = program: StartRule { return program; }

StartRule =
    nodes: (HTMLTag / HTMLSelfClose / EscapedMustache / Mustache / Content)* {
    return nodes;
}


Content "Content" =
    //and(&) checks for existence without moving the poitner, allowing us to star content grabbing.
    //without and, if content is in a * block and returns false, we hit an infinite loop
    &ContentCharacter ContentCharacter* {
        return {
            type: 'Content',
            line: line(),
            column: column(),
            text: text()
        }
    }

ContentCharacter =
    !("<" / "{{" / "}}" ) char : SourceCharacter {
    return char
}
