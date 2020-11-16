import { Scene } from 'phaser';
import { isDebug } from '../utils/Utils';

export default class SpriteDropZone {

  sprite: Phaser.GameObjects.Sprite;
  zone: Phaser.GameObjects.Zone;
  scene: Scene;
  draggedOver: boolean;

  constructor(scene: Scene, x: integer, y: integer, width: integer, height: integer, texture: string) {
    this.scene = scene;
    this.zone = scene.add.zone(x, y, width, height).setRectangleDropZone(width, height);
    this.zone.setDisplayOrigin(0, 0);
    this.sprite = scene.add.sprite(x, y, texture, 0);
    //this.sprite.setInteractive();
  }

  dragover() {
    if (!this.draggedOver) {
      this.sprite.displayHeight = this.sprite.displayHeight + 2;
      this.sprite.displayWidth = this.sprite.displayWidth + 2;
      this.draggedOver = true;
    }
  }

  dragout() {
    if (this.draggedOver) {
      this.sprite.displayHeight = this.sprite.displayHeight - 2;
      this.sprite.displayWidth = this.sprite.displayWidth - 2;
      this.draggedOver = false;
    }
  }

  highlight(enabled: boolean = true) {
    const zone = this.zone;
    this.sprite.setFrame(enabled ? 1 : 0);
    let debug = isDebug(this.scene);
    if (debug) {
      var graphics = this.scene.add.graphics();
      graphics.lineStyle(2, 0xffff00);
      graphics.strokeRect(
        zone.x,
        zone.y,
        zone.width,
        zone.height
      );
    }
  }

  removeSelf() {
    this.scene.children.remove(this.sprite);
    this.scene.children.remove(this.zone);
  }

}
