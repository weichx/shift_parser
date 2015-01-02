import ElementDescriptor = require('./ElementDescriptor');
import Util = require('../Parser/Util');

class Block {
    public htmlString : string = '';
    public elementDescriptors : Array<ElementDescriptor> = [];
    public elementDescriptorIndices : Array<number> = [];
    public elementCount : number = -1;
    public blockFunction : () => boolean;
    public blockGenerator : () => Block[];
    public contentVariables : {} = {};
    public blockScopeVariables : {} = {};
    private currentElementDescriptor : ElementDescriptor;

    constructor() {
    }

    public pushVariable(variable : any) : void {
        this.currentElementDescriptor.variables.push(variable);
    }

    public pushContent(content : string) : void {
        this.currentElementDescriptor.content.push(content);
    }

    public closeElementDescriptor() : void {
        if(!this.currentElementDescriptor) return;
        if(!this.currentElementDescriptor.isEmpty()) {

            var lastContentIndex = this.currentElementDescriptor.content.length - 1;
            var firstContent = this.currentElementDescriptor.content[0];
            var lastContent = this.currentElementDescriptor.content[lastContentIndex];

            this.currentElementDescriptor.content[0] = Util.trimLeft(firstContent);
            this.currentElementDescriptor.content[lastContentIndex] = Util.trimRight(lastContent);
            this.elementDescriptors.push(this.currentElementDescriptor);
            this.elementDescriptorIndices.push(this.currentElementDescriptor.index);
        }
    }

    public openElementDescriptor() : void {
        this.elementCount++;
        this.currentElementDescriptor = new ElementDescriptor(this.elementCount);
    }
}

export = Block;