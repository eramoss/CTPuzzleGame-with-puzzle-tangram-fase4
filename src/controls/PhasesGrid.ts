import { GameObjects, Scene } from "phaser";
import AlignGrid from "../geom/AlignGrid";
import { globalSounds } from "../scenes/PreGame";
import { TestApplication } from "../test-application/TestApplication";
import { joinChilds } from "../utils/Utils";
import Button from "./Button";

export default class PhasesGrid {
  scene: Scene;
  grid: AlignGrid;

  constructor(scene: Scene, grid: AlignGrid) {
    this.scene = scene;
    this.grid = grid;
  }

  setApplications(testApplications: TestApplication[], columns: number = 2) {

    let btnPlays: Button[] = []
    testApplications.forEach((testApplication: TestApplication, index: number) => {
      let btn = new Button(this.scene, globalSounds, 0, 0, 'yellow-btn', () => { })
      btn.setScale(this.grid.scale)
      btnPlays.push(btn)
      let name = testApplication.name;
      btn.setText(name);
    })

    let sprites = btnPlays.map(btn => btn.sprite);
    Phaser.Actions.GridAlign(sprites, {
      x: this.grid.cellWidth * 4,
      y: this.grid.cellHeight * 4,
      cellWidth: this.grid.cellWidth * 10,
      cellHeight: this.grid.cellHeight * 3,
      width: columns,
      //position: Phaser.Display.Align.CENTER
    })

    const scale = this.grid.scale;
    btnPlays.forEach(btn => {
      btn.text.setScale(scale);
      btn.text.setFontSize(30);
      btn.ajustTextPosition(20 * scale, 10 * scale)
    });

  }
}
