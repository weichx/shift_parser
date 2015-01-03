import Util = require('./DTSUtil');
import ClassStructure = require('./ClassStructure');
import FunctionStructure = require('./FunctionStructure');
import PropertyStructure = require('./PropertyStructure');

var eyes = require('eyes');

class Module {
    public name : string;
    public classes : {[s : string] : ClassStructure} = {};
    public parentModuleName : string = null;
    private currentClass : ClassStructure;

    constructor(name : string) {
        this.name = name;
    }

    public pushClass(classStruct : ClassStructure) : void {
        this.currentClass = classStruct;
        this.classes[classStruct.className] = classStruct;
    }

    public pushProperty(prop : PropertyStructure) : void {
        this.currentClass.properties[prop.name] = prop;
    }

    public pushFunction(fn : FunctionStructure) : void {
        this.currentClass.functions[fn.name] = fn;
    }
}

enum Mode {
    LookForDeclaration,
    ParsingModule,
    ParsingClass
}

class DTSParser {
    private charPointer : number = 0;
    private mode : Mode = Mode.LookForDeclaration;
    private modules : Array<Module> = [];
    private currentModule = new Module('__Default');

    constructor() {
        this.modules.push(this.currentModule);
    }

    public parse(file : string) {
        var lines = file.split('\n');
        lines.forEach(function (line) {
            if (Util.isOnlyWhitespace(line)) return;

            switch (this.mode) {
                case Mode.LookForDeclaration:
                    if (Util.isDeclaration(line)) {
                        if (Util.isClass(line)) {
                            this.startParseClass(line);
                        } else if (Util.isModule(line)) {
                            this.parseModule(line);
                        } else {
                            throw new Error("Invalid while looking for declaration: " + line);
                        }
                    }
                    break;
                case Mode.ParsingClass:
                    //todo handle complex return or property types that are multi line!
                    //will mark as 'complex' since we only support primitives and class
                    //types in templates, but will much up our parsing!
                    //if(this.parsingMultiLineType) {
                    //  keep parsing it, will need to track depth of { most likely
                    //}
                    if (Util.isClosingBrace(line)) { //careful here, could be closing complex return type
                        this.endParseClass();
                    } else {
                        this.parseClassContents(line);
                    }
                    break;
                case Mode.ParsingModule:
                    break;
            }

        }, this);

        eyes['inspect'](this.modules[0].classes['Util'].functions, {maxLength: 10000});
    }

    private startParseClass(str : string) : void {
        console.log('START CLASS: ' + str);
        var className = Util.getClassName(str);
        var classStruct = new ClassStructure(className);
        classStruct.moduleName = this.currentModule.name;
        classStruct.baseClass = Util.getBaseClassName(str);
        this.currentModule.pushClass(classStruct);
        console.log(this.currentModule.classes);
        this.mode = Mode.ParsingClass;
    }

    private parseClassContents(str : string) : void {
        if (Util.isFunction(str)) {
            console.log('FUNCTION: ' + str);
            var fn = new FunctionStructure();
            fn.name = Util.getFunctionName(str);
            fn.isStatic = Util.isStatic(str);
           // fn.arguments = Util.getFunctionArguments(); we may not need this since we are just validating
            fn.returnType = Util.getReturnType(str);
            fn.visibility = Util.getVisibility(str);
            this.currentModule.pushFunction(fn);
        } else {
            console.log('PROPERTY: ' + str);
            var prop = new PropertyStructure();
            prop.name = Util.getPropertyName(str);
            prop.isStatic = Util.isStatic(str);
            prop.visibility = Util.getVisibility(str);
            prop.type = Util.getPropertyType(str);
            this.currentModule.pushProperty(prop);
        }
    }

    private endParseClass() : void {

    }

    private parseModule(line : string) : void {
        console.log('starting module');
        this.startModule(line);
    }

    private startModule(line : string) : void {
        var moduleName = Util.getModuleName(line);
        this.modules[moduleName] = new Module(moduleName);
    }
}

export = DTSParser;
