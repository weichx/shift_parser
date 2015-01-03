class TemplateInterface {
    public variables : Array<{[variableName : string] : string}> = [];

    public addVariable(variableName : string, variableType : string) : void {
        this.variables.push({
            variableName: variableName,
            variableType: variableType
        });
    }
}

export = TemplateInterface;