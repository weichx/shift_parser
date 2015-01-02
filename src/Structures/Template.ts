import Block = require('./Block');

class Template {
    public name : string = 'TemplateDefaultName';
    public blocks: Array<Block> = [];
    public variables = [];

    public addBlock(block : Block) : void {
        this.blocks.push(block);
    }
}

export = Template;