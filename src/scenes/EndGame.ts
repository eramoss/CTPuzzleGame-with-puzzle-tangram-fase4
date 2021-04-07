import Phaser from 'phaser';
import AlignGrid from '../geom/AlignGrid';
import TestApplicationService from '../test-application/TestApplicationService';
import { androidOpenUrl } from '../utils/Utils';

export default class EndGame extends Phaser.Scene {

  constructor() {
    super('end-game');
  }

  init(testApplicationService: TestApplicationService) {
    console.log('END_GAME')
    let participation = testApplicationService.getParticipation();

    let isTestApplication = testApplicationService.isTestApplication()
    if (isTestApplication) {
      let url = participation?.urlToEndOfTestQuiz?.url;
      if (url) {
        androidOpenUrl(url)
      }
    }
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
