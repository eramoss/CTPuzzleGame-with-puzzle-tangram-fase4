import { Scene } from "phaser";
import AlignGrid from "../geom/AlignGrid";
import SpriteDropZone from "../controls/SpriteDropZone";

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

export function createDropZone(grid: AlignGrid, cellx: number, celly: number, colspan: number, rowspan: number, texture: string): SpriteDropZone {
    const rect: Phaser.Geom.Rectangle = grid.getArea(cellx, celly, colspan, rowspan);
    const dropZone = new SpriteDropZone(grid.scene, rect.x, rect.y, rect.width, rect.height, texture);
    grid.placeAt(cellx, celly, dropZone.sprite, colspan, rowspan);
    return dropZone;
}


export function vibrate(time: number) {
    console.log(`Calling GameJavascriptInterface.vibrate with param ${time}ms`)
    //@ts-ignore
    if (!GameJavascriptInterface) {
        console.log("Ambiente web. Não possui GameJavascriptInterface (Somente Android). Ocorrerá um erro a seguir: ")
    }
    //@ts-ignore
    GameJavascriptInterface.vibrate(time)
}