import { Scene } from 'phaser';
import Sounds from '../sounds/Sounds';
import { androidVibrate } from '../utils/Utils';

export default class Button {

  sprite: Phaser.GameObjects.Sprite;
  blinked: boolean = false;
  blinkingInterval: number;
  hover: boolean;
  disabled: boolean = false

  constructor(scene: Scene, sounds: Sounds, x: integer, y: integer, spriteKey: string, onClickHandler: () => any) {
    const sprite = scene.add.sprite(x, y, spriteKey, 0).setInteractive({ cursor: 'pointer' });
    sprite.on('pointerover', () => {
      this.hover = true;
      sprite.setFrame(1)
      sounds.hover();
    })
    sprite.on('pointerout', () => {
      this.hover = false;
      sprite.setFrame(0)
    })
    sprite.on('pointerup', () => {
      sprite.setFrame(1)
    })
    sprite.on('pointerdown', () => {
      if (this.disabled) return;
      androidVibrate(30)
      sprite.setFrame(2)
      onClickHandler();
    })
    this.sprite = sprite;
  }

  blink() {
    this.stopBlink();
    this.blinkingInterval = setInterval(() => { this.toggleBlink() }, 300)
  }

  stopBlink() {
    this.blinked = false;
    clearInterval(this.blinkingInterval);
    this.sprite.setFrame(0)
  }

  toggleBlink() {
    if (!this.blinked) {
      this.sprite.setFrame(1);
      this.blinked = true;
    } else {
      this.blinked = false;
      this.sprite.setFrame(0);
    }
  }

  disable() {
    this.disabled = true;
  }
  enable() {
    this.disabled = false;
  }
}
