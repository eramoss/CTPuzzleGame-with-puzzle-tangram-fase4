import { GameObjects, Sound } from 'phaser';
import SpriteDropZone from '../controls/SpriteDropZone';
import Sounds from '../sounds/Sounds';
import CommandAction from './CommandAction';
import CommandIntent from './CommandIntent';
import Program from './Program';

export default class Command {


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

  constructor(scene: Phaser.Scene, sprite: GameObjects.Sprite) {
    this.name = sprite.texture.key;
    this.sprite = sprite;
    this.sprite.setDepth(2);
    this.scene = scene;
    this.isConditional = this.name.startsWith('if');
  }

  index(): number {
    return this.program?.commands.indexOf(this)
  }

  setCondition(ifCommand: Command) {
    this.condition?.removeSelf();
    if (ifCommand.placedOver) {
      ifCommand.placedOver.condition = null;
    }
    this.condition = ifCommand;
    ifCommand.placedOver = this;
    let { x, y } = this.getConditionalPosition();
    ifCommand.setPosition(x, y);
    new Sounds(this.scene).drop()
  }

  getConditionalPosition(): { x: number, y: number, width: number, height: number } {
    const x = this.sprite.x;
    const y = this.sprite.y - this.sprite.height * this.program.grid.scale;
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

  removeSelf(removeFromScene: Boolean = true) {
    this.condition?.removeSelf();
    console.log("COMMAND_REMOVE_SELF [command][removeFromScene][index]", this.name, removeFromScene, this.index());
    if (this.isConditional && this.placedOver) {
      this.placedOver.condition = null;
    }
    if (this.program != null) {
      this.program.removeCommand(this, removeFromScene);
    } else {
      if (removeFromScene) {
        new Sounds(this.scene).remove()
        this.scene.children.remove(this.sprite);
      }
    }
    if (!this.isIntent) {
      if (removeFromScene) {
        this.tileDropZone?.removeSelf();
        this.tileDropZone = null;
      }
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

  animateSprite() {
    if (!this.animated) {
      this.animated = true;
      this.sprite.rotation += 0.05
      this.sprite.setScale(this.sprite.scale + 0.1);
    }
  }

  disanimateSprite() {
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
}


