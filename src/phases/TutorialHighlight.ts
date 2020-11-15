import { GameObjects, Physics, Scene } from "phaser";
import CodeEditor from "../controls/CodeEditor";
import AlignGrid from "../geom/AlignGrid";
import InterfaceElement from "../InterfaceElement";
import Command from "../program/Command";
import { DEPTH_OVERLAY_PANEL_TUTORIAL } from "../scenes/Game";
import { isDebug } from "../utils/Utils";
import TutorialDropLocation from "./TutorialDropLocation";

export default class TutorialHighlight {


    fnGetInterfaceElement: () => InterfaceElement
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
    commandSpriteToEnableOnInterval: Physics.Arcade.Sprite;
    onInteractAdvanceTutorial: () => void;
    removeDraggingElement: () => void;
    functionsRunningByTimeout: number[] = [];
    tutorialDropImageIndicator: GameObjects.Image;

    constructor(
        scene: Scene,
        grid: AlignGrid,
        fnGetInterfaceElement: () => InterfaceElement,
        fnGetDropLocation: () => TutorialDropLocation
    ) {
        this.scene = scene;
        this.grid = grid;
        this.fnGetInterfaceElement = fnGetInterfaceElement;
        this.fnGetDropLocation = fnGetDropLocation;
    }

    contrastAndShowHandPointing(onInteractAdvanceTutorial: () => void) {
        this.onInteractAdvanceTutorial = onInteractAdvanceTutorial;
        const sprite = this.runFnGetSprite();

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
            this.isDragMoveAnimationCancelled = false;
            this.originalX = sprite.x;
            this.originalY = sprite.y;
            this.useHandAnimationDragging();
        }
    }

    private bringHandSpriteToFront() {
        this.handSprite.setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL + 3);
    }

    private bringSpriteToFront(sprite: Physics.Arcade.Sprite) {
        this.waitAndRun(1, () => {
            this.tutorialDropImageIndicator?.setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL + 2);
            sprite?.setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL + 2);
        })
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

        const commandSprite = this.runFnGetSprite();
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
                .sprite(commandSprite.x, commandSprite.y, 'hand-tutorial')

        }

        this.handSprite.play(this.handAnimationKey)
            .setScale(this.grid.scale)
            .setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL + 2);

        const timeToCloseHand = 200;
        const timeBeforeRepeat = 200;
        this.putHandSpriteOver(commandSprite);
        this.handSprite.setVisible(true);

        this.waitAndRun(timeToCloseHand, () => {
            if (!this.isDragMoveAnimationCancelled) {

                this.removeDraggingElement = () => {
                    commandSprite.body?.stop()
                    this.scene.children.remove(commandSprite);
                }

                commandSprite.emit('drag');
                commandSprite.emit('dragstart', null, {
                    dontRecreate: false,
                    muteDragSound: true,
                    muteDropSound: true,
                    onCreateCommandBelow: (codeEditor: CodeEditor, command: Command) => {
                        const callbackOnPointerDown = () => {
                            this.cancelDragAnimation();
                            this.bringSpriteToFront(commandSprite);

                        }
                        this.onReplaceCommand(command, callbackOnPointerDown);
                    }
                });
                commandSprite.alpha = 0.7
                this.handSprite.alpha = 0.7
                this.bringDropzoneToFront(dropLocation);
                this.bringSpriteToFront(commandSprite);

                this.moveSpriteTo(
                    commandSprite,
                    dropLocation,
                    {
                        onUpdateSpritePosition: () => this.putHandSpriteOver(commandSprite),
                        stopCondition: () => {
                            return this.checkIfHandAchievedDestine(commandSprite, dropLocation)
                                || this.isDragMoveAnimationCancelled
                        },
                        onAchieve: () => {
                            console.log('TUTORIAL_HIGHLIGHT [onAchievePositionRepeat]');
                            this.simulateDrop(commandSprite, dropLocation);
                            this.waitAndRun(timeBeforeRepeat,
                                () => {
                                    this.handSprite.setVisible(false);
                                    this.simulateClickToRemove(commandSprite);
                                    const reusingSprites = true;
                                    this.useHandAnimationDragging(reusingSprites)
                                });
                        }
                    });
            }
        });
    }


    waitAndRun(time: number, fn: () => void) {
        this.functionsRunningByTimeout.push(setTimeout(() => { fn(); }, time))
    }

    clearTimeouts() {
        this.functionsRunningByTimeout.forEach(timeout => {
            clearTimeout(timeout);
        });
        this.functionsRunningByTimeout = [];
    }

    private onReplaceCommand(newCommand: Command, callbackOnPointerDown: () => void) {
        console.log('TUTORIAL_HIGHLIGHT [createdCommand]', newCommand);
        newCommand.isRemoveSoundElabled = false;
        const newCommandSprite = newCommand.getSprite();
        this.bringSpriteToFront(newCommandSprite);
        this.bringHandSpriteToFront();
        //newCommandSprite.setTint(0xff00ff);
        newCommandSprite.setInteractive();
        newCommandSprite.on('pointerdown', () => {
            callbackOnPointerDown();
            newCommandSprite.on('pointerup', () => {
                this.removeDropIndicator();
                this.onInteractAdvanceTutorial();
            });
        });
        this.commandSpriteToEnableOnInterval = newCommandSprite;
    }

    private simulateDrop(sprite: Physics.Arcade.Sprite, dropLocation: TutorialDropLocation) {
        sprite.body.stop();
        sprite.emit('drop', null, dropLocation.dropZone);
        sprite.emit('dragend');
        //this.putHandSpriteOver(sprite);
    }

    private simulateClickToRemove(sprite: Physics.Arcade.Sprite) {
        sprite.emit('dragstart', null, {
            dontRecreate: true,
            muteDragSound: true
        });
        sprite.emit('dragend', { playRemoveSound: false });
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

        if (isDebug(this.scene)) {
            var graphics = this.scene.add.graphics();
            graphics.fillStyle(0xff0000);
            graphics.fillCircle(x, y, 20 * this.grid.scale)
        } else {
            this.addTutorialDropIndicator(x, y);
        }

        if (sprite.body) {
            const speed = 160;
            this.scene.physics.moveTo(sprite, x, y, speed * this.grid.scale);
        }
        if (!this.intervalWatchDragMove) {
            this.intervalWatchDragMove = setInterval(() => {
                callbacks.onUpdateSpritePosition()
                let achieved = callbacks.stopCondition()
                if (achieved) {
                    this.stopMoveLoop();
                    this.intervalWatchDragMove = null;
                    callbacks.onAchieve()
                }
            }, 10);
        }
    }

    private addTutorialDropIndicator(x: number, y: number) {
        this.removeDropIndicator();
        this.tutorialDropImageIndicator =
            this.scene.add.image(x, y, 'tutorial-drop-indicator')
                .setScale(this.grid.scale);
    }

    private stopMoveLoop() {
        clearInterval(this.intervalWatchDragMove);
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
        this.commandSpriteToEnableOnInterval.body.stop()
        this.removeDraggingElement();
        this.stopMoveLoop();
        this.intervalWatchDragMove = null;
        this.scene.children.remove(this.handSprite);
    }

    backToOriginalPosition() {
        const sprite = this.runFnGetSprite();
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
        /* let sprite = this.fnGetInterfaceElement()
        sprite.setDepth(this.spriteDepthBackup); */
    }

    runFnGetSprite(): Phaser.Physics.Arcade.Sprite {
        const interfaceElement = this.fnGetInterfaceElement();
        if (interfaceElement)
            return interfaceElement.getSprite()
    }

    reset() {
        this.removeDraggingElement?.();
        this.clearTimeouts();
        this.stopMoveLoop();
        this.removeHand();
        this.resetDepth();
        this.removeDropIndicator();
    }

    private removeDropIndicator() {
        if (this.tutorialDropImageIndicator) {
            this.scene.children.remove(this.tutorialDropImageIndicator);
            this.tutorialDropImageIndicator = null;
        }
    }
}