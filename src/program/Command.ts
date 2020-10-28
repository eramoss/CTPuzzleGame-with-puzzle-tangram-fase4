import { GameObjects } from 'phaser';
import SpriteDropZone from '../controls/SpriteDropZone';
import drawRect from '../utils/Utils';
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
  intent: CommandIntent;

  constructor(scene: Phaser.Scene, sprite: GameObjects.Sprite) {
    this.name = sprite.texture.key;
    this.sprite = sprite;
    this.sprite.setDepth(2);
    this.scene = scene;
  }

  index(): number {
    return this.program?.commands.indexOf(this)
  }

  createTileDropZone(updatingPosition: boolean = false) {
    if (this.tileDropZone) {
      if (!updatingPosition) {
        this.updateTileDropZonePosition();
        return;
      }
    }
    let scale = this.program.grid.scale;
    const width = this.sprite.width * scale;
    const height = this.sprite.height * scale;
    this.tileDropZone = new SpriteDropZone(this.scene,
      this.sprite.x - width / 2,
      this.sprite.y - height / 2,
      width,
      height,
      'tile-drop-zone'
    );
    this.tileDropZone.highlight();
    this.tileDropZone.sprite.displayOriginX = 0;
    this.tileDropZone.sprite.displayWidth = width
    this.tileDropZone.sprite.displayOriginY = 0;
    this.tileDropZone.sprite.displayHeight = height
    this.tileDropZone.sprite.setDepth(1);
  }

  updateTileDropZonePosition(): void {
    if (this.tileDropZone) {
      this.tileDropZone.removeSelf();
      let updating = true;
      this.createTileDropZone(updating);
    }
  }

  getAction(): string {
    let action: string = ''
    const textureKey = this.sprite.texture.key;
    switch (textureKey) {
      case 'arrow-up': action = 'up'; break;
      case 'arrow-down': action = 'down'; break;
      case 'arrow-left': action = 'left'; break;
      case 'arrow-right': action = 'right'; break;
      default: action = textureKey
    }
    return action;
  }

  setPosition(x: number, y: number) {
    this.sprite.x = x;
    this.sprite.y = y;
  }

  setProgram(program: Program, index: number = -1) {
    if (this.program != program) {
      if (this.program != undefined) {
        let removeSpriteFromScene = false;
        this.removeSelf(removeSpriteFromScene);
      }
    }
    this.program = program;
    this.intent = null;
    this.program.addCommand(this, index);
  }

  removeSelf(removeFromScene: Boolean = true) {
    if (this.program != null) {
      console.log("COMMAND_REMOVE_SELF")
      this.program.removeCommand(this, removeFromScene);
      this.program.updateCommandsDropZonesPositions();
    } else {
      if (removeFromScene) {
        this.scene.children.remove(this.sprite);
      }
    }
    if (!this.isIntent) {
      this.tileDropZone?.removeSelf();
      this.tileDropZone = null;
    }
  }

  cancelMovement() {
    console.log("CANCEL_MOVEMENT")
    this.sprite.x = this.sprite.input.dragStartX;
    this.sprite.y = this.sprite.input.dragStartY;
  }

  isProgCommand() {
    return this.getAction().indexOf('prog') > -1
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
}
