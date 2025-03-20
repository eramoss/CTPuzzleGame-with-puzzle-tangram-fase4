import Phaser from "phaser";
import AlignGrid from "../geom/AlignGrid";
import { Logger } from "../main";
import TestApplicationService from "../test-application/TestApplicationService";
import { androidOpenUrl } from "../utils/Utils";

export default class EndGame extends Phaser.Scene {
  grid: AlignGrid;

  constructor() {
    super("end-game");
  }

  init(testApplicationService: TestApplicationService) {
    Logger.log("END_GAME");
    let participation = testApplicationService?.participation;
    if (participation) {
      if (testApplicationService.isItemToPlay()) {
        androidOpenUrl(participation?.urlToEndOfTestQuiz?.url);
      }
    }
  }

  preload() {
    this.load.image("background", "assets/ct/radial_gradient.png");
  }

  create() {
    this.createGrid();
    this.addBackground();
  }

  private createGrid() {
    let grid = new AlignGrid(
      this,
      26,
      22,
      this.game.config.width as number,
      this.game.config.height as number
    );
    //grid.show(0.4);
    this.grid = grid;
  }

  private addBackground() {
    this.grid.addImage(0, 0, "background", this.grid.cols, this.grid.rows);
  }
}
