import PropertyStructure = require('./PropertyStructure');
import FunctionStructure = require('./FunctionStructure');

class ClassStructure {
    public moduleName : string;
    public className : string;
    public baseClass : string;
    public ancestry : string [];
    public properties : {[key : string] : PropertyStructure} = {};
    public functions : {[key : string] : FunctionStructure} = {};

    constructor(str : string) {
        this.className = str;
    }
}

export = ClassStructure;