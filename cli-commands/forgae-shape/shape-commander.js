const fs = require('fs');

class ShapeCommander {
    constructor() {
        this.subCommands = new Map();
        this.name = 'al'
        this.init();
    }

    init(){
        let files = fs.readdirSync(__dirname);

        for(let file of files) {
            
            if(file.includes('-cmd.js') > 0){
                const subCommand = require('./' + file);
                this.subCommands.set(subCommand.subCommand, subCommand.run);
            }
        }
    }

    async run(type) {

        let notFound = 'Type of shape is not found!';

        if(!type) {
            throw new Error(notFound);
        }

        let subCommand = this.subCommands.get(type.toLowerCase());
        if (!subCommand) {
            throw new Error(notFound);
        } 
        
        await (subCommand(type));
    }
}

const shapeCommander = new ShapeCommander();

module.exports = {
    run: async (options) => {
        shapeCommander.run(options)
    }
}