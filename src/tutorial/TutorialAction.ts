import { GameObjects, Scene } from "phaser";
import AlignGrid from "../geom/AlignGrid";
import { DEPTH_OVERLAY_PANEL_TUTORIAL } from "../scenes/Game";
import TutorialHighlight from "./TutorialHighlight";

export default class TutorialAction {


    scene: Scene;
    grid: AlignGrid;
    highlights: Array<TutorialHighlight>;
    next: TutorialAction
    blockClickBackgroundImage: GameObjects.Sprite;
    handClickSprite: GameObjects.Sprite;

    constructor(scene: Scene, grid: AlignGrid, highlights: Array<TutorialHighlight>) {
        this.scene = scene;
        this.grid = grid;
        this.highlights = highlights;
    }

    reset() {
        this.removeBackgroundOverlay();
        this.removeHand();
        this.scene.children.getAll().forEach(c => c.setInteractive());
        this.highlights.forEach(highlight => {
            let sprite = highlight.fnGetSprite()
            sprite.setDepth(highlight.spriteDepthBackup);
        })
    }


    execute() {
        this.blockClickBackgroundImage = this.scene.add.sprite(0, 0, 'tutorial-block-click-background')
            .setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL);
        this.grid.placeAt(0, 0, this.blockClickBackgroundImage, this.grid.cols, this.grid.rows);
        this.disableAllInteractions();
        this.highlights.forEach(highlight => {
            let sprite = highlight.fnGetSprite()
            sprite.setInteractive();
            highlight.spriteDepthBackup = sprite.depth;
            sprite.setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL + 1);
            let interaction = () => {
                this.removeBackgroundOverlay();
                this.removeHand();
                this.next?.execute();
                if (!this.next) {
                    this.scene.children.remove(this.blockClickBackgroundImage);
                }
            }
            sprite.on('pointerdown', interaction)
            if (highlight.mustClick) {
                this.useHandAnimationPointing(sprite);
            }
        })
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

    private removeHand() {
        this.scene.children.remove(this.handClickSprite);
    }

    private removeBackgroundOverlay() {
        this.scene.children.remove(this.blockClickBackgroundImage);
    }

    private disableAllInteractions() {
        this.scene.children.getAll().forEach(c => c.disableInteractive());
    }


}