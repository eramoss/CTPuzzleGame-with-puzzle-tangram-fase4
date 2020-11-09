import { GameObjects, Scene } from "phaser";
import AlignGrid from "../geom/AlignGrid";
import { DEPTH_OVERLAY_PANEL_TUTORIAL } from "../scenes/Game";

export default class TutorialHighlight {

    fnGetSprite: () => GameObjects.Sprite | GameObjects.Image
    handClickSprite: GameObjects.Sprite;
    mustClick: boolean = false
    spriteDepthBackup: number;
    scene: Phaser.Scene;
    grid: AlignGrid;
    onClickListener: () => void;

    constructor(scene: Scene, grid: AlignGrid, fnGetSprite: () => GameObjects.Sprite | GameObjects.Image, mustClick: boolean = true) {
        this.scene = scene;
        this.grid = grid;
        this.fnGetSprite = fnGetSprite;
        this.mustClick = mustClick;
    }

    useHandAnimationPointing(sprite: GameObjects.Sprite | GameObjects.Image) {
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

    onClickTutorialStep(fnOnClick: () => void) {
        let sprite = this.fnGetSprite()

        this.spriteDepthBackup = sprite.depth;
        sprite.setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL + 1);

        if (this.mustClick) {
            sprite.setInteractive();
            this.useHandAnimationPointing(sprite);
            this.onClickListener = () => {
                this.removeHand();
                this.resetDepth();
                fnOnClick();
                sprite.removeListener('pointerup', this.onClickListener);
            }
            sprite.on('pointerup', this.onClickListener)
        }
    }

    removeHand() {
        console.log('TUTORIAL_HIGHLIGHT_REMOVING_HAND', this.handClickSprite)
        this.scene.children.remove(this.handClickSprite);
    }

    resetDepth() {
        let sprite = this.fnGetSprite()
        sprite.setDepth(this.spriteDepthBackup);
    }
}