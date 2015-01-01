import ElementDescriptor = require('./ElementDescriptor');

class Block {
    public htmlString : string = '';
    public elementDescriptors : Array<ElementDescriptor> = [];
    public elementDescriptorIndices : Array<number> = [];
    public elementCount : number;
    public blockFunction : () => boolean;
    public blockGenerator : () => Block[];
    public contentVariables : {}  = {};
    public blockScopeVariables : {} = {};
}

export = Block;