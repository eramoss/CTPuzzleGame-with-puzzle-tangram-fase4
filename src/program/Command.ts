import { GameObjects } from 'phaser';

export default class Command {

  sprite: GameObjects.Sprite;
  scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, sprite: GameObjects.Sprite) {
    this.sprite = sprite;
    this.scene = scene;
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
}
