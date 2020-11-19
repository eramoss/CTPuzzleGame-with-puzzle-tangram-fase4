import { Scene } from "phaser";
import drawRect from "../utils/Utils";

export default class Ballon {

    ballon: Phaser.GameObjects.Image;
    phrase: Phaser.GameObjects.Text;
    scale: number;
    scene: Scene;
    constructor(scene: Scene, scale: number) {
        this.scene = scene;
        this.scale = scale;
        this.ballon = scene.add.image(0, 0, 'ballon')
            .setScale(scale*1.2)
            .setDepth(1000);

        this.phrase = scene.add.text(0, 0, '', {
            fontFamily: 'arial',
        })
            .setScale(scale)
            .setFontStyle('bold')
            .setAlign('center')
            .setDepth(1001)
            .setTint(0x810101);

    }

    setText(text: string, fontSize: number = 30): Ballon {
        this.setVisible();
        this.phrase.setText(text);
        this.phrase.setFontSize(fontSize);
        return this;
    }

    setVisible(visible: boolean = true) {
        this.ballon?.setVisible(visible);
        this.phrase?.setVisible(visible);
    }

    ajustBallonPosition(x: number, y: number) {
        let diffX = +150 * this.scale;
        let diffY = -150 * this.scale;
        this.ballon.setX(x + diffX);
        this.ballon.setY(y + diffY);
        let xajust = this.ballon.displayWidth - this.phrase.displayWidth / 2;
        let yajust = this.ballon.displayHeight - this.phrase.displayHeight / 2 - this.scale * 4;
        this.phrase.setX(this.ballon.x - this.ballon.displayWidth + xajust);
        this.phrase.setY(this.ballon.y - this.ballon.displayHeight + yajust);

        drawRect(this.scene, this.ballon.x - this.ballon.displayWidth / 2, this.ballon.y - this.ballon.displayHeight / 2, this.ballon.displayWidth, this.ballon.displayHeight);
        drawRect(this.scene, this.phrase.x, this.phrase.y, this.phrase.displayWidth, this.phrase.displayHeight);
    }
}