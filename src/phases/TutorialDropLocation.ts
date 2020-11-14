import Command from "../program/Command";
import Program from "../program/Program";

export default class TutorialDropLocation {

    sprite: Phaser.GameObjects.Sprite;
    dropZone: Phaser.GameObjects.Zone;
    program: Program;
    position: { x: number; y: number; } = null;

    constructor(program: Program, command: Command = null) {
        this.program = program;
        this.sprite = program.sprite;
        this.dropZone = program.dropZone.zone;
    }

    getXY(sprite: Phaser.GameObjects.Sprite): { x: number, y: number } {
        if (this.position == null) {
            let fakeCommand = new Command(this.program.scene, sprite)
            this.position = this.program.getNextFreePosition(fakeCommand)
        }
        return this.position
    }

    setDepth(depth: number) {
        this.program.setDepth(depth)
    }

}