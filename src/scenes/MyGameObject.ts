import { GameObjects } from "phaser";

export class MyGameObject {
  gameObject: GameObjects.GameObject
  life:number

  constructor(gameObject:GameObjects.GameObject){
    this.gameObject = gameObject;
  }

  setDepth(depth: number) {
    (this.gameObject as GameObjects.Sprite).setDepth(depth)
  }
  getDepth(): number {
    return (this.gameObject as GameObjects.Sprite).depth
  }
  setTint(tint: number) {
    (this.gameObject as GameObjects.Image).setTint(tint);
  }

  advanceFrame() {
    let sprite = this.gameObject as GameObjects.Sprite
    sprite.anims.nextFrame();
  }
}
