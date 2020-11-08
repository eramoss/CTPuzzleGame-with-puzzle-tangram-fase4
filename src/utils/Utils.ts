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


export function androidVibrate(time: number) {
    console.log(`Calling GameJavascriptInterface.vibrate with param ${time}ms`)
    try {
        //@ts-ignore
        if (GameJavascriptInterface != undefined) {
            //@ts-ignore
            GameJavascriptInterface.vibrate(time)
        }
    } catch (e) {
        console.warn('GameJavascriptInterface is not defined!!');
    }
}

export function androidPlayAudio(sound: string): boolean {
    console.log(`Calling GameJavascriptInterface.play with param ${sound}`)
    let couldPlay = false;
    try {
        //@ts-ignore
        if (GameJavascriptInterface != undefined) {
            //@ts-ignore
            GameJavascriptInterface.play(sound)
            couldPlay = true;
        }
    } catch (e) {
        console.warn('GameJavascriptInterface is not defined!!');
    }
    return couldPlay;
}

/**
 * O flatMap to es2015 não existia nos navegadores mais antigos.
 * Por isso criei essa função que faz a mesma coisa
 */
export function joinChilds<PARENT, CHILD>(parents: Array<PARENT>, fnGetChilds: (p: PARENT) => Array<CHILD>): Array<CHILD> {
    let allChildren = new Array<CHILD>()
    parents.forEach(parent=>{
        fnGetChilds(parent).forEach(child=>{
            allChildren.push(child);
        })
    });
    return allChildren
}