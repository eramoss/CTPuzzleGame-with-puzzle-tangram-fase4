import { GameObjects } from "phaser";

export default class TutorialHighlight {
    fnGetSprite: () => GameObjects.Sprite | GameObjects.Image
    mustClick: boolean = false
    spriteDepthBackup: number;

    constructor(fnGetSprite: () => GameObjects.Sprite | GameObjects.Image, mustClick: boolean = true) {
        this.fnGetSprite = fnGetSprite;
        this.mustClick = mustClick;
    }
}