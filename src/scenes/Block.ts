import { Scene } from "phaser";
import { MyGameObject } from "./MyGameObject";

export class Block extends MyGameObject {

  breakMore(damage: number = 1) {
    this.life = this.life - damage
    this.advanceFrame()
  }

  isBroken() {
    return this.life <= 0;
  }

  constructor(x: integer, y: integer, scale: number, scene: Scene) {
    const blockSprite = scene.physics.add.sprite(x, y - 35 * scale, 'block-sprite')
      .play('block-sprite')
      .setScale(scale * 1.7)
    super(blockSprite);
    this.life = blockSprite.anims.getTotalFrames();
  }

}
