import { Scene } from "phaser";
import AlignGrid from "../geom/AlignGrid";

export class Loading {
  image: Phaser.GameObjects.Image;

  constructor(scene: Scene, grid: AlignGrid) {
    scene.anims.create({
      key: 'loading',
      frames: scene.anims.generateFrameNumbers('loading', { start: 0, end: 4 }),
      frameRate: 0.5,
      repeat: -1
    })
    let cell = grid.getCell(13,11);
    this.image = scene.add.sprite(cell.x, cell.y, 'loading', 2)
      .play('loading')
    this.image.setScale(grid.scale);
    this.image.setDepth(500);
    this.hide();
  }

  show() {
    this.setVisible(true);
  }

  hide() {
    this.setVisible(false);
  }

  setVisible(arg0: boolean) {
    this.image.setFrame(0);
    this.image.setVisible(arg0);
  }
}
