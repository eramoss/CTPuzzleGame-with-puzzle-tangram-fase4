import { Scene } from "phaser"
import { MyGameObject } from "./MyGameObject";

export class Coin extends MyGameObject {
  constructor(x: number, y: number, scene: Scene, scale: number) {
    const goldSpinningSprite = scene.physics.add
        .sprite(x, y - 35 * scale, 'coin-gold')
        .play('gold-spining')
        .setScale(scale)
    super(goldSpinningSprite);
  }
}
