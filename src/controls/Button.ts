import { Scene } from 'phaser';
import InterfaceElement from '../InterfaceElement';
import Sounds from '../sounds/Sounds';
import { androidVibrate } from '../utils/Utils';

export default class Button implements InterfaceElement {
  ajustTextPosition(xDiff: number = 0, yDiff: number = 0): void {
    this.text.x = this.sprite.x + xDiff - this.sprite.displayWidth / 2
    this.text.y = this.sprite.y + yDiff - this.sprite.displayHeight / 2
  }

  sprite: Phaser.GameObjects.Sprite;
  blinked: boolean = false;
  blinkingInterval: number;
  hover: boolean;
  disabled: boolean = false
  scene: Scene
  text: Phaser.GameObjects.Text;

  constructor(scene: Scene, sounds: Sounds, x: integer, y: integer, spriteKey: string, onClickHandler: () => any) {
    this.scene = scene;
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
      if (this.disabled) return;
      sprite.setFrame(1)
      androidVibrate(30)
      onClickHandler();
    })
    sprite.on('pointerdown', () => {
      if (this.disabled) return;
      sprite.setFrame(2)
    })
    this.sprite = sprite;
  }

  getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite as Phaser.Physics.Arcade.Sprite
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

  disableInteractive() {
    this.sprite.disableInteractive();
  }
  setInteractive() {
    this.sprite.setInteractive();
  }

  setDepth(depth: number): void {
    this.sprite.setDepth(depth);
  }

  setText(value: string, cell: { x: number, y: number } = { x: this.sprite.x, y: this.sprite.y }) {
    let text = this.scene.add.text(cell.x, cell.y, '', {
      fontFamily: 'Dyuthi, arial',
    })
      .setFontStyle('bold')
      .setFontSize(100)
      .setAlign('center')
      .setDepth(1001)
      .setTint(0xffffff);
    text.setText(value);
    this.text = text;
  }

  setScale(scale: number) {
    this.text?.setScale(scale);
    this.sprite?.setScale(scale);
  }

  setVisible(visible: boolean) {
    this.sprite.setVisible(visible);
    this.text?.setVisible(visible);
  }
}
