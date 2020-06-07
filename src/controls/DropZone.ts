import { Scene } from 'phaser';

export default class DropZone {
  sprite: Phaser.GameObjects.Sprite;
  zone: Phaser.GameObjects.Zone;

  constructor(scene: Scene, x: integer, y: integer, width: integer, height: integer, paddingTop: integer, texture: string) {
    this.zone = scene.add.zone(x, y + paddingTop, width, height).setRectangleDropZone(width, height);
    this.sprite = scene.add.sprite(x, y, texture, 0).setInteractive();
  }

  highlight(enabled: boolean = true) {
    this.sprite.setFrame(enabled ? 1 : 0);
  }

}
