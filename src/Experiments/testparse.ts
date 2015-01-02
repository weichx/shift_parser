import Util = require('../Parser/Util');

var consumeVisibility = function (line) {
    var publicIndex = line.indexOf('public');
    var privateIndex = line.indexOf('private');

    if (line.indexOf('public') !== -1) {
        return line.substring('public'.length + 1);
    } else if(privateIndex !== -1) {
        return line.substring('private'.length + 1);
    } else {
        return line;
    }
};

var isStatic = function(propertyString) {
    return propertyString.indexOf('static') === 0;
};

var consumeStatic = function(propertyString) {
    if(isStatic(propertyString)) {
        propertyString = propertyString.substring('static'.length + 1);
    }
    return propertyString;
};

var isFunction = function(line : string) : boolean {
    return line.indexOf('(') !== -1;
};

var buildJson = function (str : string) {
    var json = {};
    var lines = str.split('\n');
    lines.forEach(function (line) {
        line = line.trim();
        line = consumeVisibility(line);
        line = consumeStatic(line);
        console.log(line);
    });
};
var fs = require('fs');
var str = fs.readFileSync('dest/Parser/Util.d.ts');
buildJson(str.toString());



//interface Eyes {
//   inspect: (str, options?) => void;
//}
//var eyes = <Eyes>require('eyes');
//
//Parser.compileTemplateFromFile('templates/test0.shift', function(err, template) {
//   eyes.inspect(template);
//});
//
//

class ClassDescriptor {
    public moduleName : string;
    public className : string;
    public baseClass : string;
    public properties : Array<PropertyDescriptor>;
    public functions : Array<FunctionDescriptor>;
}

class Structure {
    public isPublic : boolean;
    public isStatic : boolean;
    public isProperty : boolean;
    public isFunction : boolean;
    public fnArgumentTypes : string[];
    public fnReturnType : string;
    public propertyType : string;
}
