import { GameObjects, Scene } from "phaser";
import AlignGrid from "../geom/AlignGrid";

export default class TutorialAction {

    spriteDepthBackup: number;
    scene: Scene;
    grid: AlignGrid;
    sprite: GameObjects.Sprite | GameObjects.Image;
    next: TutorialAction
    actionName: string;
    blockClickBackgroundImage: GameObjects.Image;
    handClickSprite: GameObjects.Sprite;

    constructor(scene: Scene, grid: AlignGrid, actionName: string, sprite: GameObjects.Sprite | GameObjects.Image) {
        this.scene = scene;
        this.grid = grid;
        this.actionName = actionName;
        this.sprite = sprite;
    }

    reset() {
        this.scene.children.remove(this.blockClickBackgroundImage);
        this.scene.children.remove(this.handClickSprite);
    }

    execute() {
        this.blockClickBackgroundImage = this.grid.addImage(0, 0, 'tutorial-block-click-background').setDepth(99);
        this.spriteDepthBackup = this.sprite.depth
        this.sprite.setDepth(100);
        this.sprite.on('pointerdown', () => {
            this.sprite.setDepth(this.spriteDepthBackup);
            this.reset();
            this.next?.execute();
            if (!this.next) {
                this.scene.children.remove(this.blockClickBackgroundImage);
            }
        })
        if (this.actionName == 'click') {
            this.useHandAnimationPointing(this.sprite);
        }
    }

    private useHandAnimationPointing(sprite: GameObjects.Sprite | GameObjects.Image) {
        this.scene.anims.create({
            key: 'hand-tapping',
            frames: this.scene.anims.generateFrameNumbers('hand-tutorial', { start: 0, end: 7 }),
            frameRate: 12,
            repeat: -1
        });
        this.handClickSprite = this.scene
            .add
            .sprite(
                sprite.x + 20 * this.grid.scale,
                sprite.y + sprite.height / 3,
                'hand-tutorial'
            )
            .play('hand-tapping')
            .setScale(this.grid.scale)
            .setDepth(100);
    }
}