import { GameObjects, Scene } from "phaser"
import { MyGameObject } from "./MyGameObject";

export class Battery extends MyGameObject {
  text: GameObjects.Text;
  scene: Scene;
  scale: number;
  gainOnHitBattery:number;

  constructor(x: number, y: number, scene: Scene, scale: number,gainOnHitBattery:number) {
    const batterySprite = scene.physics.add
      .sprite(x, y - 35 * scale, 'battery-sprite')
      .play('battery-sprite')
      .setScale(scale)
    super(batterySprite);
    this.scene = scene;
    this.scale = scale;
    this.gainOnHitBattery = gainOnHitBattery;
    this.createText(x, y);
  }

  private createText(x: number, y: number) {
    let scene = this.scene;
    let scale = this.scale;
    let text = scene.add.text(x - 25 * scale, y - 130 * scale, `+${this.gainOnHitBattery}`);
    text.setFontSize(35);
    text.setTint(0x21fe44);
    text.setFontFamily('Dyuthi, sans-serif')
    //text.setShadow(2, 2, 'red', 10, true, true)
    text.setScale(scale);
    text.setDepth(this.getSprite().depth + 1);
    text.setFontStyle('bold');
    this.text = text;
  }

  setDepth(depth: number) {
    super.setDepth(depth);
    this.text.setDepth(depth + 1);
  }

  removeSelf(scene: Scene) {
    super.removeSelf(scene);
    scene.children.remove(this.text)
  }
}
