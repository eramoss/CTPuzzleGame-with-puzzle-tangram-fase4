import { Scene } from "phaser";
import AlignGrid from "../geom/AlignGrid";
import DropZone from "../controls/DropZone";

export default function drawRect(scene: Scene, x: number, y: number, width: number, height: number) {
    if (scene.game.config.physics.arcade?.debug) {
        var graphics = scene.add.graphics();
        graphics.lineStyle(2, 0xffff00);
        graphics.strokeRect(
            x,
            y,
            width,
            height
        );
    }
}

export function createDropZone(grid: AlignGrid, cellx: number, celly: number, colspan: number, rowspan: number, texture: string): DropZone {
    const rect: Phaser.Geom.Rectangle = grid.getArea(cellx, celly, colspan, rowspan);
    const dropZone = new DropZone(grid.scene, rect.x, rect.y, rect.width, rect.height, texture);
    grid.placeAt(cellx, celly, dropZone.sprite, colspan, rowspan);
    return dropZone;
}