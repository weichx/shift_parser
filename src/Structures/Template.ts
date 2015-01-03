import Block = require('./Block');
import TemplateInterface = require('./TemplateInterface');

class Template {
    public name : string = 'TemplateDefaultName';
    public blocks: Array<Block> = [];
    public variables = [];
    public templateInterface : TemplateInterface;

    public defineInterface(desc : any) : void {

    }

    public addBlock(block : Block) : void {
        this.blocks.push(block);
    }
}

export = Template;