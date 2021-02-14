import { Scene } from "phaser";
import AlignGrid from "../geom/AlignGrid";
import { globalSounds } from "../scenes/PreGame";
import { androidVibrate } from "../utils/Utils";
import Button from "./Button";

export default class Keyboard {
  scene: Scene;
  onClick: (value: string) => void = () => { };
  grid: AlignGrid;
  buttons: Array<Button>;

  constructor() {
    this.buttons = [];
  }

  preload(scene: Scene) {
    this.scene = scene;
    this.scene.load.spritesheet('blue-btn', 'assets/ct/pregame/blue-button.png', { frameWidth: 165, frameHeight: 152 });

    this.grid = new AlignGrid(scene, 15, 10,
      scene.game.config.width as number,
      scene.game.config.height as number
    )
  }

  create() {
    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'X']
      .forEach((value: string, index: number) => {
        let btn = new Button(this.scene, globalSounds, 0, 0, 'blue-btn', () => {
          androidVibrate(30)
          this.onClick(value)
        })
        let col = index + 2;
        let row = 7;
        this.grid.placeAt(col, row, btn.sprite, 1);
        let cell = this.grid.getCell(col + 0.3, row + 0.2);
        btn.setText(value, cell)
        this.buttons.push(btn);
        btn.setScale(this.grid.scale);
      })
  }

  show() {
    this.buttons.forEach(button => { button.setVisible(true) })
  }

  hide() {
    this.buttons.forEach(button => { button.setVisible(false) })
  }

}
