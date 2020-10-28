import { Scene } from "phaser";
import Command from "./Command";

export default class CommandIntent {
    commandIntent: Command;

    constructor(scene: Scene, commandHovered: Command) {
        let scale = commandHovered.program.grid.scale;
        const commandIntent = new Command(scene, scene.add.sprite(commandHovered.sprite.x, commandHovered.sprite.y, 'intention_comamnd'));
        commandIntent.sprite.scale = scale;
        commandIntent.commandIntent = this;
        commandIntent.tileDropZone = commandHovered.tileDropZone;
        commandIntent.sprite.setDepth(1);
        let program = commandHovered.program;
        program.addCommand(commandIntent, commandHovered.index())
        commandIntent.setProgram(program);
        this.commandIntent = commandIntent;
    }

    consolidateIntentionToDrop(newCommand: Command) {
        let index = this.commandIntent.index();
        let program = this.commandIntent.program;
        newCommand.setProgram(program, index);
        this.commandIntent.removeSelf();
        program.updateCommandsDropZonesPositions();
    }

}