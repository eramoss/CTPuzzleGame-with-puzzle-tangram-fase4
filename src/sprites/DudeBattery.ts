import { Scene } from "phaser";
import AlignGrid from "../geom/AlignGrid";

export class DudeBattery {
  scene: Scene;
  grid: AlignGrid;
  batteryImage: Phaser.GameObjects.Image;
  graphics: Phaser.GameObjects.Graphics;
  maxCells: number;

  constructor(scene: Scene, grid: AlignGrid) {
    this.scene = scene;
    this.grid = grid;
    this.batteryImage = this.grid.addImage(0.5, 1, 'battery', 4, 2);
    this.graphics = scene.add.graphics()
    this.setLevel(8, 10, 0);
  }

  setLevel(level: number, maxCells = 10, cellMargin: number = 2) {
    cellMargin = cellMargin * this.grid.scale;
    this.maxCells = maxCells;
    this.setColorByLevel(level / maxCells);

    const width = this.batteryImage.displayWidth
    const height = this.batteryImage.displayHeight;

    const cellWidth = (width * 0.86 / this.maxCells) - cellMargin;

    let firstX = this.batteryImage.x - width / 2;
    let y = this.batteryImage.y - height / 2;

    this.setText(firstX, y + height, `${level} / ${maxCells}`);

    let countCells = 0;
    for (let x = firstX; countCells < level; x += cellWidth + cellMargin) {
      let radius = { tl: cellMargin, tr: cellMargin, bl: cellMargin, br: cellMargin }
      if (countCells == 0) {
        radius.tl = 5;
        radius.bl = 5;
      }
      this.graphics.fillRoundedRect(
        x + cellMargin * 2,
        y + cellMargin * 3,
        cellWidth,
        height - cellMargin * 6,
        radius);
      countCells++;
    }

  }
  setText(x: number, y: number, text: string) {
    this.scene.add.text(x, y, text, {})
      .setScale(this.grid.scale)
      .setFontFamily('arial')
      .setFontStyle('bold')
      .setFontSize(40)
      .setAlign('center')
      .setDepth(1001)
      .setTint(0xffffff)
  }

  setColorByLevel(percentLevel: number) {

    this.graphics.setDepth(1)
    this.batteryImage.setDepth(2);
    this.graphics.fillStyle(0x21fd44, 1);
    /* if (percentLevel < 0.7) {
      this.graphics.fillStyle(0xc60502, 1);
    }
    if (percentLevel < 0.4) {
      this.graphics.fillStyle(0xd67120, 1);
    } */
    if (percentLevel < 0.3) {
      this.graphics.fillStyle(0xfe2222, 1);
      this.graphics.setDepth(2)
      this.batteryImage.setDepth(1);
    }
  }
}
