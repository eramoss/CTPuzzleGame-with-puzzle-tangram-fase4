import { GameObjects, Scene } from "phaser";
import AlignGrid from "../geom/AlignGrid";
import { DEPTH_OVERLAY_PANEL_TUTORIAL } from "../scenes/Game";

export default class TutorialAction {

    spriteDepthBackup: number;
    scene: Scene;
    grid: AlignGrid;
    fnGetSprite: () => GameObjects.Sprite | GameObjects.Image;
    next: TutorialAction
    actionName: string;
    blockClickBackgroundImage: GameObjects.Image;
    handClickSprite: GameObjects.Sprite;

    constructor(scene: Scene, grid: AlignGrid, actionName: string, fnGetSprite: () => GameObjects.Sprite | GameObjects.Image) {
        this.scene = scene;
        this.grid = grid;
        this.actionName = actionName;
        this.fnGetSprite = fnGetSprite;
    }

    reset() {
        this.scene.children.remove(this.blockClickBackgroundImage);
        this.scene.children.remove(this.handClickSprite);
    }

    execute() {
        this.blockClickBackgroundImage = this.grid
            .addImage(0, 0, 'tutorial-block-click-background', this.grid.cols, this.grid.rows)
            .setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL);
        const sprite = this.fnGetSprite()
        this.spriteDepthBackup = sprite.depth
        sprite.setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL + 1);
        sprite.on('pointerdown', () => {
            sprite.setDepth(this.spriteDepthBackup);
            this.reset();
            this.next?.execute();
            if (!this.next) {
                this.scene.children.remove(this.blockClickBackgroundImage);
            }
        })
        if (this.actionName == 'click') {
            this.useHandAnimationPointing(sprite);
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
            .setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL + 2);
    }
}