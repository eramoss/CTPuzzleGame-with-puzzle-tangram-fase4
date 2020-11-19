import { Scene } from "phaser";
import drawRect from "../utils/Utils";

export default class Ballon {
    constructor(scene: Scene, text: string, x: number, y: number, scale: number, fontSize: number = 30) {
        let diffX = +150 * scale;
        let diffY = -150 * scale;

        const ballon = scene.add.image(x + diffX, y + diffY, 'ballon')
            .setScale(scale)
            .setDepth(1000);

        const phrase = scene.add.text(0, 0, text, {
            fontFamily: 'Dyuthi',
        })
            .setScale(scale)
            .setAlign('center')
            .setFontSize(fontSize)
            .setDepth(1001)
            .setTint(0x810101);

        let xajust = ballon.displayWidth - phrase.displayWidth / 2
        let yajust = ballon.displayHeight - phrase.displayHeight / 2 - scale * 4
        phrase.setX(ballon.x - ballon.displayWidth + xajust);
        phrase.setY(ballon.y - ballon.displayHeight + yajust);

        drawRect(scene, ballon.x - ballon.displayWidth / 2, ballon.y - ballon.displayHeight / 2, ballon.displayWidth, ballon.displayHeight);
        drawRect(scene, phrase.x, phrase.y, phrase.displayWidth, phrase.displayHeight);
    }
}