class Util {

    public p : {s : string};
    public z : string;

    public static isClosingBrace(str : string) {
        return str.trim() === '}';
    }

    public static isOnlyWhitespace(str : string) {
        return str.trim() === '';
    }

    public static isDeclaration(str : string) {
        return str.indexOf('declare') !== -1;
    }

    public static isClass(str : string) {
        return str.indexOf('class') !== -1;
    }

    public static hasBaseClass(str : string) {
        return str.indexOf('extends');
    }

    public static getBaseClassName(str : string) {
        if (str.indexOf('extends') === -1) return null;
        var startIndex = str.indexOf('extends') + 'extends'.length + 1;
        var substr = str.substring(startIndex);
        var spaceIndex = substr.indexOf(' ');
        return substr.substr(0, spaceIndex).trim();
    }

    public static isModule(str : string) : boolean {
        return str.indexOf('module') !== -1;
    }

    public static getModuleName(str : string) : string {
        var startIndex = str.indexOf('module') + 'module'.length + 1;
        var substr = str.substring(startIndex);
        var spaceIndex = substr.indexOf(' ');
        return substr.substr(0, spaceIndex).trim();
    }

    public static getClassName(str : string) : string {
        var startIndex = str.indexOf('class') + 'class'.length + 1;
        var substr = str.substring(startIndex);
        var spaceIndex = substr.indexOf(' ');
        return substr.substr(0, spaceIndex).trim();
    }

    public static isFunction(str : string) : boolean {
        return str.indexOf('(') !== -1;
    }

    public static isStatic(str : string) : boolean {
        return str.indexOf('static') !== -1;
    }

    public static getVisibility(str : string) : string {
        return (str.indexOf('private') !== -1 && 'private') || 'public';
    }

    public static getFunctionName(str : string) : string {
        var openParenIndex = str.indexOf('(');
        var char = '(';
        var index = openParenIndex;
        while (char !== ' ') {
            index--;
            char = str.charAt(index);
        }
        return str.substring(index + 1, openParenIndex);
    }

    //todo this is wrong but good enough for now. need to make sure we match the paren pairs correctly
    //right now this doesn't handle return types like () => {} (puts it on new line)
    //it may be enough to mark it as '::complex' or something like that
    public static getReturnType(str : string) : string {
        var startParen = str.indexOf('(');
        var closeParen = Util.findClosingParen(str, startParen);
        var secondHalf = str.substring(closeParen + 1);
        var startRetnIndex = secondHalf.indexOf(':');
        if (startRetnIndex === -1) {
            return 'any';
        } else {
            if(Util.isComplexType(secondHalf)) {
                return '::complex';
            }
            var endRetnIndex = secondHalf.indexOf(';');
            return secondHalf.substring(startRetnIndex + 2, endRetnIndex);
        }
    }

    public static isComplexType(str : string) : boolean {
        return str.indexOf('{') !== -1 || str.indexOf('(') !== -1;
    }

    public static findClosingParen(text : string, openPos : number) {
        var closePos = openPos;
        var counter = 1;
        while (counter > 0) {
            var c = text[++closePos];
            if (c == '(') {
                counter++;
            }
            else if (c == ')') {
                counter--;
            }
        }
        return closePos;
    }

    public static getPropertyName(str : string) : string {
        var typeStart = str.indexOf(':');
        if(typeStart === -1) {
            var strList = str.trim().split(' ');
            return strList[strList.length - 1].slice(0, -1);
        }
        return null;
    }

    public static getPropertyType(str : string) : string {
        var typeStart = str.indexOf(':');
        if(typeStart === -1) {
            return 'any';
        } else {
            var type = str.substring(typeStart).trim();
            if(type.indexOf('(') !== -1 || type.indexOf('{') !== -1) {
                return '::complex';
            } else {
                return type;
            }
        }
    }

}

export = Util;