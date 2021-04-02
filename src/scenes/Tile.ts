import { Scene } from "phaser";
import { MyGameObject } from "./MyGameObject";

export class Tile extends MyGameObject {

  constructor(x: number, y: number, scene: Scene, scale: number) {
    const tileImage = scene.add
      .image(x, y + 10 * scale, 'tile')
      .setScale(scale * 1.6)
    super(tileImage);
  }
}
