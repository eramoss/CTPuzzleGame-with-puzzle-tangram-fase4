import { Scene } from 'phaser';

export default class Button {

  constructor(scene: Scene, x: integer, y: integer, spriteKey: string, onClickHandler: () => any) {
    const btnPlay = scene.add.sprite(x, y, spriteKey, 0).setInteractive({ cursor: 'pointer' });
    btnPlay.on('pointerover', () => {
      btnPlay.setFrame(1)
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
