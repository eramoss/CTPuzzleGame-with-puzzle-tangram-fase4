import { GameObjects } from "phaser";

export class MyGameObject {

  gameObject: GameObjects.GameObject
  life:number

  constructor(gameObject:GameObjects.GameObject){
    this.gameObject = gameObject;
  }

  getSprite():GameObjects.Sprite{
    return (this.gameObject as GameObjects.Sprite)
  }

  setDepth(depth: number) {
    this.getSprite().setDepth(depth)
  }
  getDepth(): number {
    return this.getSprite().depth
  }
  setTint(tint: number) {
    this.getSprite().setTint(tint);
  }

  removeSelf(scene: Phaser.Scene) {
    scene.children.remove(this.gameObject);
  }

  advanceFrame() {
    let sprite = this.getSprite()
    sprite.anims.nextFrame();
  }
}
