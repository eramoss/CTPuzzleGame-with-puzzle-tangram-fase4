import { GameObjects, Sound } from 'phaser';
import SpriteDropZone from '../controls/SpriteDropZone';
import AlignGrid from '../geom/AlignGrid';
import InterfaceElement from '../InterfaceElement';
import Sounds from '../sounds/Sounds';
import CommandAction from './CommandAction';
import CommandIntent from './CommandIntent';
import Program from './Program';

export default class Command implements InterfaceElement {


  sprite: GameObjects.Sprite;
  scene: Phaser.Scene;
  program: Program;
  name: string;
  programDropZone: SpriteDropZone;
  tileDropZone: SpriteDropZone;
  animated: boolean;
  isIntent: boolean = false;
  isConditional: boolean = false;
  intent: CommandIntent;
  condition: Command;
  placedOver: Command;
  isDragged: boolean = false;
  highlightConditionalImage: GameObjects.Image;
  sounds: Sounds
  isRemoveSoundElabled: boolean = true;
  isDropSoundEnabled: boolean = true;

  constructor(scene: Phaser.Scene, sprite: GameObjects.Sprite) {
    this.name = sprite.texture.key;
    this.sprite = sprite;
    //this.sprite.setDepth(52);
    this.scene = scene;
    this.isConditional = this.name.startsWith('if');
    this.sounds = new Sounds(scene)
  }

  index(): number {
    let index = -1;
    if (this.isConditional) {
      this.program?.conditionalCommandsIndexed.forEach((command, key) => {
        if (command == this) {
          index = key;
        }
      })
    }
    if (!this.isConditional) {
      index = this.program?.ordinalCommands.indexOf(this);
    }
    return index;
  }

  setCondition(ifCommand: Command, removePreviousCondition: boolean = true) {
    if (ifCommand != this.condition) {
      if (this.condition) {
        this.condition.placedOver = null;
        if (removePreviousCondition) {
          this.condition.removeSelf();
        }
      }
      if (ifCommand.placedOver) {
        ifCommand.placedOver.removeCondition();
      }
      ifCommand.placedOver = this;
      ifCommand.program = this.program;
      this.condition = ifCommand;
      let { x, y } = this.getConditionalPosition();
      ifCommand.setPosition(x, y);
      if (removePreviousCondition) {
        this.program?.setConditionalCommand(this.index(), ifCommand);
      }
      this.playDrop();
    }
  }

  playDrop() {
    if (this.isDropSoundEnabled) {
      this.sounds.drop();
    }
  }

  removeCondition() {
    this.condition.placedOver = null;
    this.condition = null;
  }

  removeSelf(removeFromScene: Boolean = true) {
    console.log("COMMAND_REMOVE_SELF [command][removeFromScene][index]", this.name, removeFromScene, this.index());
    if (this.condition) {
      this.condition.placedOver = null;
      this.condition = null;
    }
    if (this.isConditional) {
      this.program?.removeConditional(this);
      //this.program?.removeConditionalCommandOf(this)
      this.placedOver?.removeCondition();
    }
    if (removeFromScene) {
      this.scene.children.remove(this.sprite);
    }
    if (this.program != null) {
      this.program.removeCommand(this, removeFromScene);
    }
    if (!this.isIntent) {
      if (removeFromScene) {
        if (this.isRemoveSoundElabled)
          this.sounds.remove()
        this.tileDropZone?.removeSelf();
        this.tileDropZone = null;
      }
    }
  }

  getConditionalPosition(): { x: number, y: number, width: number, height: number } {
    const x = this.sprite.x;
    const y = this.sprite.y - (this.sprite.height * this.program.grid.scale) * 0.8;
    const width = this.sprite.width;
    const height = this.sprite.height;
    return { x, y, width, height };
  }

  getDropzonePosition(): { x: number, y: number, width: number, height: number } {
    let scale = this.program.grid.scale;
    const width = this.sprite.width * scale;
    const height = this.sprite.height * scale * 1.7;
    const x = this.sprite.x - width / 2;
    const y = this.sprite.y - height / 1.4;
    return { x, y, width, height }
  }

  createTileDropZone() {
    if (this.tileDropZone == null) {
      let { x, y, width, height } = this.getDropzonePosition();
      this.tileDropZone = new SpriteDropZone(this.scene,
        x,
        y,
        width,
        height,
        'tile-drop-zone'
      );
      //this.tileDropZone.highlight();
      this.tileDropZone.sprite.displayOriginX = 0;
      this.tileDropZone.sprite.displayWidth = width
      this.tileDropZone.sprite.displayOriginY = 0;
      this.tileDropZone.sprite.displayHeight = height
      this.tileDropZone.sprite.setDepth(1);
    }
  }

  updateTileDropZonePosition(): void {
    if (this.tileDropZone) {
      if (this.program) {
        let { x, y } = this.getDropzonePosition();
        this.tileDropZone.zone.x = x
        this.tileDropZone.zone.y = y
        this.tileDropZone.sprite.x = x
        this.tileDropZone.sprite.y = y
        //this.tileDropZone.highlight();
      }
    }
  }

  getAction(): CommandAction {
    let action: string = ''
    const textureKey = this.sprite.texture.key;
    const condition = this.condition?.sprite.texture.key
    switch (textureKey) {
      case 'arrow-up': action = 'up'; break;
      case 'arrow-down': action = 'down'; break;
      case 'arrow-left': action = 'left'; break;
      case 'arrow-right': action = 'right'; break;
      default: action = textureKey
    }
    return new CommandAction(action, condition);
  }

  setPosition(x: number, y: number) {
    this.sprite.x = x;
    this.sprite.y = y;
  }

  setProgram(program: Program, index: number = -1) {
    if (!this.isConditional) {
      this.program = program;
      this.intent = null;
      this.program?.addCommand(this, index);
    }
  }

  cancelMovement() {
    console.log("CANCEL_MOVEMENT");
    this.sprite.x = this.sprite.input.dragStartX;
    this.sprite.y = this.sprite.input.dragStartY;
  }

  isProgCommand() {
    return this.getAction().action.indexOf('prog') > -1
  }

  animateSprite(success: boolean = true) {
    if (!this.animated) {
      this.animated = true;
      this.sprite.rotation += 0.05
      this.sprite.setScale(this.sprite.scale + 0.1);
      if (this.condition) {
        this.condition?.animateSprite();
      }
      if (!this.condition) {
        if (!this.isConditional) {
          if (success) {
            if (!this.isProgCommand()) {
              this.sounds.start();
            }
          } else {
            this.sounds.blocked();
          }
        }
      }
      this.sprite.setTint(0xffff00);
    }
  }

  disanimateSprite() {
    this.removeHighlightConditionImage();
    this.condition?.disanimateSprite();
    if (this.animated) {
      this.animated = false;
      this.sprite.rotation -= 0.05
      this.sprite.clearTint();
      this.sprite.setScale(this.sprite.scale - 0.1);
    }
  }

  removeHighlightConditionImage() {
    this.scene.children.remove(this.highlightConditionalImage)
  }

  addHighlightConditionalImage() {
    let { x, y } = this.getConditionalPosition();
    this.highlightConditionalImage = this.scene.add.image(x, y, 'if_highlight')
    this.highlightConditionalImage.scale = this.program.grid.scale;
  }

  highlightTrueState() {
    this.sprite.setTint(0x00cf00)
    this.sounds.blink()
  }

  highlightFalseState() {
    this.sprite.setTint(0xe44332)
    this.sounds.error()
  }

  unmuteBlockRemovingSound() {
    this.isRemoveSoundElabled = true;
  }
  muteBlockRemovingSound() {
    this.isRemoveSoundElabled = false;
  }

  isSpriteConsiderableDragged(grid: AlignGrid): boolean {
    let dragHorizontal = Math.abs(this.sprite.input.dragStartX - this.sprite.x) > 50 * grid.scale
    let dragVertical = Math.abs(this.sprite.input.dragStartY - this.sprite.y) > 50 * grid.scale
    return dragHorizontal || dragVertical;
  }

  getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite as Phaser.Physics.Arcade.Sprite
  }

  isSameTexture(command: Command): boolean {
    return this.sprite.texture === command.sprite.texture
  }
}


