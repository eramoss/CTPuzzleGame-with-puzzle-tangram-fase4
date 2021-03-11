import { Scene } from "phaser";
import AlignGrid from "../geom/AlignGrid";
import FlexFlow from "../geom/FlexFlow";
import { globalSounds } from "../scenes/PreGame";
import { androidVibrate } from "../utils/Utils";
import Button from "./Button";

export enum KeyboardType { QWERT, NUMBERS }

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

    this.grid = new AlignGrid(scene, 24, 18,
      scene.game.config.width as number,
      scene.game.config.height as number
    )
  }

  create(keyboardType: KeyboardType = KeyboardType.QWERT) {
    let keysRows = [];
    if (keyboardType == KeyboardType.NUMBERS) {
      keysRows = ['0123456789']
    }
    if (keyboardType == KeyboardType.QWERT) {
      keysRows = ['qwertyuiop', 'asdfghjklç', 'zxcvbnm', '-']
    }
    keysRows.forEach((keysRow: string, keysRowIndex: number) => {

      let keys = keysRow.split('');
      let flexFlow = new FlexFlow(this.scene);
      flexFlow.setPositionByGrid(0, keysRowIndex, 21, 2, this.grid);

      keys.forEach((value: string, index: number) => {
        let btn = new Button(this.scene, globalSounds, 0, 0, 'blue-btn', () => {
          androidVibrate(30)
          this.onClick(value)
        })
        let cell = flexFlow.addChild(btn.sprite)
        btn.setText(value, cell)
        this.buttons.push(btn);
        btn.setScale(this.grid.scale);
      })
    })
  }

  show() {
    this.buttons.forEach(button => { button.setVisible(true) })
  }

  hide() {
    this.buttons.forEach(button => { button.setVisible(false) })
  }

}
