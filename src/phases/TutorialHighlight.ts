import { GameObjects, Physics, Scene } from "phaser";
import AlignGrid from "../geom/AlignGrid";
import { DEPTH_OVERLAY_PANEL_TUTORIAL } from "../scenes/Game";

export default class TutorialHighlight {

    fnGetSprite: () => Physics.Arcade.Sprite | Physics.Arcade.Image
    handSprite: Physics.Arcade.Sprite;
    continueTutorialOnClick: boolean = false
    continueTutorialOnDrag: boolean = false
    spriteDepthBackup: number;
    scene: Phaser.Scene;
    grid: AlignGrid;
    onClickListener: () => void;
    fnGetDropSprite: () => Physics.Arcade.Sprite | Physics.Arcade.Image;
    intervalWatchDragMove: number;
    movingSprites: (Physics.Arcade.Sprite | Physics.Arcade.Image)[];
    handAnimationKey: string;
    originalX: number;
    originalY: number;
    isDragAnimationCancelled: boolean = false;
    onDragEndListener: () => void;

    constructor(
        scene: Scene,
        grid: AlignGrid,
        fnGetSprite: () => Physics.Arcade.Sprite | Physics.Arcade.Image,
        fnGetDropSprite: () => Physics.Arcade.Sprite | Physics.Arcade.Image
    ) {
        this.scene = scene;
        this.grid = grid;
        this.fnGetSprite = fnGetSprite;
        this.fnGetDropSprite = fnGetDropSprite;
    }

    contrastAndShowHandPointing(onInteractAdvanceTutorial: () => void) {
        const sprite = this.fnGetSprite();

        this.spriteDepthBackup = sprite.depth;
        sprite.setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL + 1);

        if (this.continueTutorialOnClick) {
            sprite.setInteractive();
            this.useHandAnimationPointing(sprite);
            this.onClickListener = () => {
                this.removeHand();
                this.resetDepth();
                onInteractAdvanceTutorial();
                sprite.removeListener('pointerup', this.onClickListener);
            }
            sprite.on('pointerup', this.onClickListener)
        }

        if (this.continueTutorialOnDrag) {
            sprite.setInteractive();
            this.isDragAnimationCancelled = false;
            const dropZoneSprite = this.fnGetDropSprite();
            this.onDragEndListener = () => {
                this.removeHand();
                this.resetDepth();
                onInteractAdvanceTutorial()
                sprite.removeListener('pointerout', this.onDragEndListener);
            }
            this.useHandAnimationDragging(sprite, dropZoneSprite);
        }
    }

    useHandAnimationPointing(sprite: Physics.Arcade.Sprite | Physics.Arcade.Image) {
        this.handAnimationKey = 'hand-tapping';
        this.scene.anims.create({
            key: this.handAnimationKey,
            frames: this.scene.anims.generateFrameNumbers('hand-tutorial', { start: 0, end: 7 }),
            frameRate: 8,
            repeat: -1
        });
        this.handSprite = this.scene
            .physics
            .add
            .sprite(
                sprite.x + 20 * this.grid.scale,
                sprite.y + (sprite.height / 2) * this.grid.scale,
                'hand-tutorial'
            )
            .play(this.handAnimationKey)
            .setScale(this.grid.scale)
            .setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL + 2);

    }

    cancelDragAnimation() {
        this.isDragAnimationCancelled = true;
        this.scene.children.remove(this.handSprite);
        clearInterval(this.intervalWatchDragMove);
    }

    backToOriginalPosition() {
        const sprite = this.fnGetSprite();
        sprite.body.stop();
        sprite.body.reset(this.originalX, this.originalY);
        this.handSprite.body.stop();
        this.handSprite.body.reset(this.originalX, this.originalY);
    }

    useHandAnimationDragging(
        sprite: Physics.Arcade.Sprite | Physics.Arcade.Image,
        dropZoneSprite: Physics.Arcade.Sprite | Physics.Arcade.Image,
        reusingSprites: boolean = false) {

        this.handAnimationKey = 'hand-dragging';
        if (!reusingSprites) {
            this.scene.anims.create({
                key: this.handAnimationKey,
                frames: this.scene.anims.generateFrameNumbers('hand-tutorial-drag', { start: 0, end: 3 }),
                frameRate: 16,
                repeat: 0
            });
            this.handSprite = this.scene
                .physics
                .add
                .sprite(
                    sprite.x,
                    sprite.y,
                    'hand-tutorial-drag'
                )
            this.handSprite.setInteractive();
            this.handSprite.on('pointerover', () => {
                this.cancelDragAnimation();
                this.backToOriginalPosition();
                sprite.on('pointerout', this.onDragEndListener);
            })
        }

        this.handSprite.play(this.handAnimationKey)
            .setScale(this.grid.scale)
            .setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL + 2);

        this.originalX = sprite.x
        this.originalY = sprite.y

        if (!this.isDragAnimationCancelled) {
            const onAchievePositionRepeat = () => {
                setTimeout(() => {
                    this.handSprite.setVisible(false);
                    this.backToOriginalPosition();
                    setTimeout(_ => {
                        const reusingSprites = true;
                        this.handSprite.setVisible(true);
                        this.useHandAnimationDragging(sprite, dropZoneSprite, reusingSprites)
                    }, 800)
                }, 700)

            }
            setTimeout(() => {
                clearInterval(this.intervalWatchDragMove);
                if (!this.isDragAnimationCancelled) {
                    this.moveSpritesTo(
                        [
                            this.handSprite,
                            sprite,
                        ],
                        dropZoneSprite,
                        onAchievePositionRepeat);
                }
            }, 1000);
        }

    }

    moveSpritesTo(
        sprites: Array<Physics.Arcade.Sprite | Physics.Arcade.Image>,
        destine: Physics.Arcade.Sprite | Physics.Arcade.Image,
        onAchieve: () => void) {
        this.movingSprites = sprites;
        sprites.forEach(sprite => {
            this.scene.physics.moveToObject(sprite, destine, 300 * this.grid.scale);
        })
        this.intervalWatchDragMove = setInterval(() => {
            let achieved = this.checkIfHandAchievedDestine(destine)
            if (achieved) {
                onAchieve()
            }
        }, 10);
    }

    checkIfHandAchievedDestine(dropZoneSprite: Physics.Arcade.Sprite | Physics.Arcade.Image): boolean {
        let x1 = this.handSprite.x;
        let y1 = this.handSprite.y;
        let x2 = dropZoneSprite.x;
        let y2 = dropZoneSprite.y;
        const achievedDestine = Phaser.Math.Distance.Between(x1, y1, x2, y2) < 10;
        if (achievedDestine) {
            this.movingSprites.forEach(sprite => {
                sprite.body.stop()
            })
        }
        return achievedDestine;
    }

    removeHand() {
        console.log('TUTORIAL_HIGHLIGHT_REMOVING_HAND', this.handSprite)
        this.scene.children.remove(this.handSprite);
    }

    resetDepth() {
        let sprite = this.fnGetSprite()
        sprite.setDepth(this.spriteDepthBackup);
    }
}