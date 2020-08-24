import { Scene } from 'phaser';
import Sounds from '../sounds/Sounds';

export default class Button {
  sprite: Phaser.GameObjects.Sprite;

  constructor(scene: Scene, sounds:Sounds, x: integer, y: integer, spriteKey: string, onClickHandler: () => any) {
    const sprite = scene.add.sprite(x, y, spriteKey, 0).setInteractive({ cursor: 'pointer' });
    sprite.on('pointerover', () => {
      sprite.setFrame(1)
      sounds.hover();
    })
    sprite.on('pointerout', () => {
      sprite.setFrame(0)
    })
    sprite.on('pointerup', () => {
      sprite.setFrame(1)
    })
    sprite.on('pointerdown', () => {
      sprite.setFrame(2)
      onClickHandler();
    })
    this.sprite = sprite;
  }
}
