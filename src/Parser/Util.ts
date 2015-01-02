class Util {
    private static LEGAL_VAR_NAME_REGEX = /^[$A-Z_][0-9A-Z_$]*$/i; ///^[a-zA-Z][a-zA-Z0-9]*?$/;
    private static MUSTACHE_REGEX_CONSUME = /{{(.*?)}}/;
    private static LEFT_TRIM_REGEX = /^\s+/;
    private static RIGHT_TRIM_REGEX = /\s+$/;

    public get someProp() : number {
        return 1;
    }
    public static trimLeft(text : string) : string {
        return text.replace(Util.LEFT_TRIM_REGEX, '');
    }

    public static trimRight(text : string) : string {
        return text.replace(Util.RIGHT_TRIM_REGEX, '');
    }

    public static removeNewLines(text : string) : string {
        return text.replace(/\r?\n|\r/g, '');
    }

    public static splitOnMustaches(text : string) : Array<string> {
        return text.split(Util.MUSTACHE_REGEX_CONSUME);
    }

    public static containsMustaches(text : string) : boolean {
        return text.indexOf('{{') !== -1;
    }

    public static isOnlyWhitespace(text : string) : boolean {
        return text.trim() === '';
    }

    public static convertBracketsToDots(text : string) : string {
        //todo this might be too general
        return text.replace(/]/g, '').replace(/\[/g, '.');//.replace(/\.\./g, '.');
    }

    public static containsFormatter(text : string) : boolean {
        return text.indexOf('|') !== -1;
    }

    public static extractMustacheName(mustache : string) {
        mustache = mustache.trim();
        var startIndex = 0;
        if (mustache.indexOf('#') === 0 ||
            mustache.indexOf('&') === 0 ||
            mustache.indexOf('/') === 0) {
            startIndex = 1;
        } else if (mustache.indexOf('::') === 0) {
            startIndex = 2;
        }

        var endIndex = startIndex;
        var char = mustache.charAt(startIndex);
        //if we overflow a string will return ''
        while (Util.isOnlyWhitespace(char)) {
            startIndex++;
            char = mustache.charAt(startIndex);
        }
        while (!Util.isOnlyWhitespace(char)) {
            endIndex++;
            char = mustache.charAt(endIndex);
        }
        return mustache.substring(startIndex, endIndex);
    }

    //  somevar | currency(variant) | otherformatter(variant) | novariatnformatter
    public static extractFormatterChain(text : string) : Array<String> {
        return text.split('|').slice(1).map(Util.buildFormatterName);
    }

    private static buildFormatterName(formatterString : string) : string {
        formatterString = formatterString.trim();
        var variantStartIndex = formatterString.indexOf('(');
        if (variantStartIndex !== -1) {
            var base = formatterString.substring(0, variantStartIndex);
            var variant = formatterString.substring(variantStartIndex + 1).slice(0, -1);
            return base.trim() + "_" + variant.trim();
        } else {
            return formatterString;
        }
    }

    //todo handle bracket case: something[ i ] should be ok
    public static isValidVariableName(variableNameString) : boolean {
            variableNameString = variableNameString.trim();
            for (var i = variableNameString; i < variableNameString.length; i++) {
                if (Util.isOnlyWhitespace(variableNameString[i])) {
                    return false;
                }
            }
            var splitPath = variableNameString.split('.');
            return splitPath.every(function(element) {
                return element.match(Util.LEGAL_VAR_NAME_REGEX);
            });
    }
}

export = Util;