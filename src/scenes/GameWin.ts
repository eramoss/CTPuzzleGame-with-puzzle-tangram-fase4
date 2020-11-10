import Phaser from 'phaser';
import AlignGrid from '../geom/AlignGrid';

export default class GameWin extends Phaser.Scene {

  constructor() {
    super('game-win');
  }

  preload() {
    this.load.image('trofel', 'assets/ct/trofel.png');
    this.load.image('background', 'assets/ct/radial_gradient.png');
  }

  create() {
    let grid = new AlignGrid(
      this, 26, 22,
      this.game.config.width as number,
      this.game.config.height as number
    );
    grid.addImage(0, 0, 'background', grid.cols, grid.rows);
    let centerCell = grid.getCenterCell();
    let trofelImage = grid.addImage(0, 0, 'trofel', 12);
    trofelImage.setX(centerCell.x + grid.cellWidth)
    trofelImage.setY(centerCell.y - grid.cellHeight);
  }
}
