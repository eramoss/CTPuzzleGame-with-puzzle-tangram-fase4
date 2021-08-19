import { Scene } from "phaser";
import { MyGameObject } from "./MyGameObject";

export class Tile extends MyGameObject {

  constructor(x: number, y: number, scene: Scene, scale: number, tileTexture:string) {
    const tileImage = scene.add
      .image(x, y + 10 * scale, tileTexture)
      .setScale(scale * 1.6)
    super(tileImage);
  }
}
