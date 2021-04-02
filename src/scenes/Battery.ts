import { Scene } from "phaser"
import { MyGameObject } from "./MyGameObject";

export class Battery extends MyGameObject {
  constructor(x: number, y: number, scene: Scene, scale: number) {
    const batterySprite = scene.physics.add
      .sprite(x, y - 35 * scale, 'battery-sprite')
      .play('battery-sprite')
      .setScale(scale)
    super(batterySprite);
  }
}
