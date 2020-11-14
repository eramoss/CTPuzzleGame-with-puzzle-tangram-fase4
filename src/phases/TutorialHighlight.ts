import { GameObjects, Physics, Scene } from "phaser";
import AlignGrid from "../geom/AlignGrid";
import { DEPTH_OVERLAY_PANEL_TUTORIAL } from "../scenes/Game";
import TutorialDropLocation from "./TutorialDropLocation";

export default class TutorialHighlight {

    fnGetSprite: () => Physics.Arcade.Sprite
    handSprite: Physics.Arcade.Sprite;
    spriteDepthBackup: number;
    scene: Phaser.Scene;
    grid: AlignGrid;
    onClickListener: () => void;
    fnGetDropLocation: () => TutorialDropLocation;
    intervalWatchDragMove: number;
    handAnimationKey: string;
    originalX: number;
    originalY: number;
    isDragMoveAnimationCancelled: boolean = false;
    onDragEndListener: () => void;

    constructor(
        scene: Scene,
        grid: AlignGrid,
        fnGetSprite: () => Physics.Arcade.Sprite,
        fnGetDropLocation: () => TutorialDropLocation
    ) {
        this.scene = scene;
        this.grid = grid;
        this.fnGetSprite = fnGetSprite;
        this.fnGetDropLocation = fnGetDropLocation;
    }

    contrastAndShowHandPointing(onInteractAdvanceTutorial: () => void) {
        const sprite = this.fnGetSprite();

        this.spriteDepthBackup = sprite.depth;
        this.bringSpriteToFront(sprite);

        const continueTutorialOnClick = this.fnGetDropLocation == null
        const continueTutorialOnDrag = this.fnGetDropLocation != null

        if (continueTutorialOnClick) {
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

        if (continueTutorialOnDrag) {
            sprite.setInteractive();
            this.isDragMoveAnimationCancelled = false;
            this.originalX = sprite.x;
            this.originalY = sprite.y;
            this.useHandAnimationDragging();
            this.onDragEndListener = () => {
                this.cancelDragAnimation();
                this.backToOriginalPosition();
                this.removeHand();
                this.resetDepth();
                onInteractAdvanceTutorial()
                sprite.removeListener('pointerout', this.onDragEndListener);
            }
            sprite.on('pointerout', this.onDragEndListener);
        }
    }

    private bringHandSpriteToFront() {
        this.handSprite.setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL + 3);
    }

    private bringSpriteToFront(sprite: Physics.Arcade.Sprite) {
        sprite.setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL + 2);
    }

    private bringDropzoneToFront(dropLocation: TutorialDropLocation) {
        dropLocation.setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL + 1);
    }

    useHandAnimationPointing(sprite: Physics.Arcade.Sprite) {
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
                sprite.x,
                sprite.y,
                'hand-tutorial'
            )
            .play(this.handAnimationKey)
            .setScale(this.grid.scale)
            .setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL + 2);
        this.putHandSpriteOver(sprite);

    }

    useHandAnimationDragging(
        reusingSprites: boolean = false) {

        const sprite = this.fnGetSprite();
        const dropLocation: TutorialDropLocation = this.fnGetDropLocation();

        this.handAnimationKey = 'hand-dragging';

        if (!reusingSprites) {
            this.scene.anims.create({
                key: this.handAnimationKey,
                frames: this.scene.anims.generateFrameNumbers('hand-tutorial', { start: 0, end: 2 }),
                frameRate: 16,
                repeat: 0
            });
            this.handSprite = this.scene
                .physics
                .add
                .sprite(sprite.x, sprite.y, 'hand-tutorial')
            this.handSprite.setInteractive();
            dropLocation.sprite.setInteractive();
            this.handSprite.on('pointerover', () => {
                this.cancelDragAnimation();
                this.backToOriginalPosition();
            })
        }

        this.handSprite.play(this.handAnimationKey)
            .setScale(this.grid.scale)
            .setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL + 2);

        const waitBeforeRepeat = 3000;
        const waitBeforeShowHand = 3000;
        const waitUntilHandCloseToDrag = 2000;

        sprite.emit('pointerover');
        this.putHandSpriteOver(sprite);
        this.bringSpriteToFront(sprite);
        this.bringDropzoneToFront(dropLocation);

        setTimeout(() => {
            if (!this.isDragMoveAnimationCancelled) {
                this.handSprite.disableInteractive();
                sprite.disableInteractive();

                sprite.emit('drag');
                sprite.emit('dragstart', { recreateCommandInPosition: true });
                setTimeout(() => {
                    this.bringSpriteToFront(sprite);
                }, 0);

                this.moveSpriteTo(
                    sprite,
                    dropLocation,
                    {
                        onUpdateSpritePosition: () => this.putHandSpriteOver(sprite),
                        stopCondition: () => this.checkIfHandAchievedDestine(sprite, dropLocation),
                        onAchieve: () => {
                            sprite.body.stop();
                            this.handSprite.body.stop();
                            this.simulateDrop(sprite, dropLocation);
                            console.log('TUTORIAL_HIGHLIGHT [onAchievePositionRepeat]')

                            setTimeout(() => {
                                this.simulateClickToRemove(sprite);
                                this.handSprite.setInteractive();
                                this.backToOriginalPosition();

                                this.bringSpriteToFront(this.fnGetSprite());
                                this.bringHandSpriteToFront();

                                setTimeout(_ => {
                                    const reusingSprites = true;
                                    this.bringHandSpriteToFront()
                                    this.useHandAnimationDragging(reusingSprites)
                                }, waitBeforeShowHand);

                            }, waitBeforeRepeat)
                        }
                    });
            }
        }, waitUntilHandCloseToDrag);
    }


    private simulateDrop(sprite: Physics.Arcade.Sprite, dropLocation: TutorialDropLocation) {
        sprite.emit('drop', null, dropLocation.dropZone);
        sprite.emit('dragend');
    }

    private simulateClickToRemove(sprite: Physics.Arcade.Sprite) {
        sprite.emit('dragstart', { recreateCommandInPosition: false });
        sprite.emit('dragend');
    }

    moveSpriteTo(
        sprite: Physics.Arcade.Sprite,
        dropLocation: TutorialDropLocation,
        callbacks: {
            onUpdateSpritePosition: () => void,
            stopCondition: () => boolean,
            onAchieve: () => void
        }) {
        let { x, y } = dropLocation.getXY(sprite);

        var graphics = this.scene.add.graphics();
        graphics.fillStyle(0xff0000);
        graphics.fillCircle(x, y, 20)

        this.scene.physics.moveTo(sprite, x, y, 300 * this.grid.scale);
        if (!this.intervalWatchDragMove) {
            this.intervalWatchDragMove = setInterval(() => {
                callbacks.onUpdateSpritePosition()
                let achieved = callbacks.stopCondition()
                if (achieved) {
                    clearInterval(this.intervalWatchDragMove);
                    this.intervalWatchDragMove = null;
                    callbacks.onAchieve()
                }
            }, 10);
        }
    }

    checkIfHandAchievedDestine(sprite: Physics.Arcade.Sprite, dropLocation: TutorialDropLocation): boolean {
        let x1 = sprite.x;
        let y1 = sprite.y;
        let { x, y } = dropLocation.getXY(sprite);
        const achievedDestine = Phaser.Math.Distance.Between(x1, y1, x, y) < 15;
        return achievedDestine;
    }

    cancelDragAnimation() {
        this.isDragMoveAnimationCancelled = true;
        this.scene.children.remove(this.handSprite);
    }

    backToOriginalPosition() {
        const sprite = this.fnGetSprite();
        sprite.body.stop();
        this.handSprite.body.stop();
        sprite.body.reset(this.originalX, this.originalY);
        this.putHandSpriteOver(sprite);
    }

    removeHand() {
        console.log('TUTORIAL_HIGHLIGHT_REMOVING_HAND', this.handSprite)
        this.scene.children.remove(this.handSprite);
    }

    putHandSpriteOver = (sprite: Physics.Arcade.Sprite) => {
        const newHandX = sprite.x + this.grid.scale * 15;
        const newHandY = sprite.y + this.grid.scale * 40;
        this.handSprite.x = newHandX
        this.handSprite.y = newHandY
    }

    putSpriteBelowHand = (sprite: Physics.Arcade.Sprite) => {
        const newSpriteX = this.handSprite.x - this.grid.scale * 13;
        const newSpriteY = this.handSprite.y - this.grid.scale * 38;
        sprite.x = newSpriteX
        sprite.y = newSpriteY
    }

    resetDepth() {
        let sprite = this.fnGetSprite()
        sprite.setDepth(this.spriteDepthBackup);
    }
}