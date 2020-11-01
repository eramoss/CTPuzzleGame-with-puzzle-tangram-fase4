import AlignGrid from "../geom/AlignGrid";
import FlexFlow from "../geom/FlexFlow";
import Command from "../program/Command";

export default class ToolboxRowOrganizer {
    flow: FlexFlow;
    texturesReservations: string[];
    commandsAddedTextureKey: Array<string>
    scaleNormal: number;
    scaleOnPointerOver: number
    scaleOnDragStart: number;

    constructor(grid: AlignGrid, cellx: number, celly: number, rowspan: number, colspan: number, commandNames: Array<string>, scaleNormal: number = 1) {
        this.flow = new FlexFlow(grid.scene);
        this.flow.setPositionByGrid(cellx, celly, rowspan, colspan, grid);
        this.texturesReservations = commandNames;
        this.commandsAddedTextureKey = new Array<string>()
        this.scaleNormal = grid.scale * scaleNormal;
        this.scaleOnPointerOver = grid.scale * 1.2 * scaleNormal
        this.scaleOnDragStart = grid.scale * 1.3 * scaleNormal
    }

    hasSpaceTo(command: Command): boolean {
        const textureKey = command.sprite.texture.key;
        return this.texturesReservations.indexOf(textureKey) > -1
    }

    setPositionTo(command: Command) {
        const textureKey = command.sprite.texture.key;
        let index = this.texturesReservations.indexOf(textureKey);
        let splice = this.commandsAddedTextureKey.indexOf(textureKey) == -1 ? 0 : 1;
        if (splice == 0) {
            this.commandsAddedTextureKey.push(textureKey);
        }
        command.sprite.setScale(this.scaleNormal);
        this.flow.setChildAt(command.sprite, index, splice);
    }
}