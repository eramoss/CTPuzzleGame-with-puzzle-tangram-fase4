import { Scene } from 'phaser';
import Sounds from '../sounds/Sounds';

export default class Button {

  constructor(scene: Scene, sounds:Sounds, x: integer, y: integer, spriteKey: string, onClickHandler: () => any) {
    const btnPlay = scene.add.sprite(x, y, spriteKey, 0).setInteractive({ cursor: 'pointer' });
    btnPlay.on('pointerover', () => {
      btnPlay.setFrame(1)
      sounds.hover();
    })
    btnPlay.on('pointerout', () => {
      btnPlay.setFrame(0)
    })
    btnPlay.on('pointerup', () => {
      btnPlay.setFrame(1)
    })
    btnPlay.on('pointerdown', () => {
      btnPlay.setFrame(2)
      onClickHandler();
    })
  }
}
