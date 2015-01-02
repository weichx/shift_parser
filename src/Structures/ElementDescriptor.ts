class ElementDescriptor {
    public variables : Array<string> = [];
    public content: Array<string> = [];
    public index: number = 0;

    constructor(index : number) {
        this.index = index;
    }

    public isEmpty() : boolean {
        return this.variables.length === 0 && this.content.length === 0;
    }
}

export = ElementDescriptor;