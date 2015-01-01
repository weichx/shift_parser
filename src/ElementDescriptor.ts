class ElementDescriptor {
    public variables : Array<String> = [];
    public content: Array<String> = [];
    public index: number = 0;

    public isEmpty() : boolean {
        return this.variables.length === 0 && this.content.length === 0;
    }
}

export = ElementDescriptor;