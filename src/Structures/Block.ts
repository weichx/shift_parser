import ElementDescriptor = require('./ElementDescriptor');

class Block {
    public htmlString : string = '';
    public elementDescriptors : Array<ElementDescriptor> = [];
    public elementDescriptorIndices : Array<number> = [];
    public elementCount : number;
    public blockFunction : () => boolean;
    public blockGenerator : () => Block[];
    public contentVariables : {} = {};
    public blockScopeVariables : {} = {};

    constructor() {
        this.elementDescriptors.push(new ElementDescriptor(0));
    }

    public pushVariable(variable : any) : void {
        var lastIndex = this.elementDescriptors.length - 1;
        this.elementDescriptors[lastIndex].variables.push(variable);
    }

    public pushContent(content : string) : void {
        var lastIndex = this.elementDescriptors.length - 1;
        this.elementDescriptors[lastIndex].content.push(content);
    }

    public closeElementDescriptor() : void {
    }

    public openElementDescriptor() : void {
    }
}

export = Block;