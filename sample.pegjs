Content =
    (Element / Text)*

    Element =
        startTag:sTag content:Content endTag:eTag {
    if (startTag != endTag) {
        throw new Error(
            "Expected </" + startTag + "> but </" + endTag + "> found."
        );
    }

    return {
        name:    startTag,
        content: content
    };
}
/ startTag:selfTag {
    return startTag;
}

sTag =
    "<" name:TagName ">" { return name; }

selfTag =
    "<" name:TagName "/>" { return name; }

eTag =
    "</" name:TagName ">" { return name; }

TagName = chars:[a-z-]+ { return chars.join(""); }
Text    = chars:[^<]+  { return chars.join(""); }