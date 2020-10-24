import { GameObjects } from 'phaser';
import Program from './Program';

export default class Command {

  sprite: GameObjects.Sprite;
  scene: Phaser.Scene;
  program: Program;
  name: string;
  dropZone: Phaser.GameObjects.Zone;

  constructor(scene: Phaser.Scene, sprite: GameObjects.Sprite, program: Program) {
    this.name = sprite.texture.key;
    this.sprite = sprite;
    this.scene = scene;
    this.program = program;
    sprite.removeAllListeners('pointerover');
    sprite.removeAllListeners('pointerdown');
  }

  getAction(): string {
    let action: string = ''
    switch (this.sprite.texture.key) {
      case 'arrow-up': action = 'moveUp'; break;
      case 'arrow-down': action = 'moveDown'; break;
      case 'arrow-left': action = 'moveLeft'; break;
      case 'arrow-right': action = 'moveRight'; break;
    }
    return action;
  }

  setPosition(x: number, y: number) {
    this.sprite.x = x;
    this.sprite.y = y;
  }

  setProgram(program: Program) {
    if (this.program != program) {
      let removeSpriteFromScene = false;
      this.removeSelf(removeSpriteFromScene);
    }
    this.program = program;
    this.program.addCommand(this);
  }

  removeSelf(removeFromScene: Boolean = true) {
    if (this.program != null) {
      console.log("COMMAND_REMOVE_SELF")
      this.program.removeCommand(this, removeFromScene);
    }
  }

  cancelMovement() {
    this.sprite.x = this.sprite.input.dragStartX;
    this.sprite.y = this.sprite.input.dragStartY;
  }
  
}
